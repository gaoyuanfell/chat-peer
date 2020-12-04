import {
  AddressTableMessage,
  AddressTableTypeMessage,
  arrayDiff,
  BridegMessage,
  DataBlockType,
  decodeMessage,
  encodeMessage,
  IDataBlock,
  MsgTypes,
  packForwardBlocks,
  PeerCandidate,
  PeerDescription,
  pickTypedArrayBuffer,
  unpackForwardBlocks,
} from "chat-peer-models";
import { Pool } from "../pool";
import { SocketService } from "../socket";
import { PeerMain } from "../peer";
import { Subscribe } from "../subscribe";
import { EmitTypeMainHelper } from "../subscribe";

const peerHelperSymbol = Symbol("peerHelperSymbol");

export class MainPeerHelper extends Subscribe<EmitTypeMainHelper> {
  _pool!: Pool;
  _socket!: SocketService;
  [peerHelperSymbol]: MainPeerHelper;

  constructor() {
    super();
    if (!(MainPeerHelper as any)[peerHelperSymbol]) {
      (MainPeerHelper as any)[peerHelperSymbol] = this;
    }
    return (MainPeerHelper as any)[peerHelperSymbol];
  }

  static get instance() {
    return new MainPeerHelper();
  }

  has(address: string) {
    if (!address) throw new Error("address connot be empty");
    return this._pool.has(address);
  }

  getPeer(address: string) {
    if (!address) throw new Error("address connot be empty");
    return this._pool.get(address);
  }

  get pool() {
    return this._pool;
  }

  get address() {
    return this._pool!.address;
  }

  getPeerList() {
    if (!this._pool) return [];
    return this._pool.getAll(); //.filter(([_, peer]) => peer.connected);
  }

  getServerPeerList() {
    let businessId = Math.random().toString();
    let uint = encodeMessage(MsgTypes.SERVICE_PEER_TABLE, {
      businessId: businessId,
    });
    this.socket.wssSend(uint);
    return this.socket.generatePromise<Array<string>>(businessId);
  }

  get socket() {
    return this._socket;
  }

  /**
   * 等待连接
   */
  waitingConnection(address: string) {
    return new Promise<boolean>((resolve, reject) => {
      this._pool = new Pool(address);
      (window as any).Pool = this._pool;
      /**
       * 信令服务 socket
       */
      this._socket = new SocketService();
      this._socket.connent().then(
        () => {
          let uint = encodeMessage(MsgTypes.LOGIN, {
            address: address,
          });
          this._socket.wssSend(uint);
          resolve(true);
        },
        () => {
          reject(false);
        }
      );
      this._socket.onClose = () => {
        reject(false);
      };
      this._socket.onMessage = ({ type, buffer, otherAddress }) => {
        this.onSignal(type, buffer, otherAddress);
      };
    });
  }

  /**
   * 主动发起连接
   * otheAddress 连接地址
   * bridgeAddress 桥接地址
   */
  launch(otheAddress: string, bridgeAddress?: string) {
    if (this.address === otheAddress)
      throw new Error(`you can't connect to yourself`);
    let peer = this._pool.get(otheAddress);
    if (peer.connected) return peer;
    this.peerBindSendEvent(peer);
    peer.bridgeAddress = bridgeAddress;
    peer.launchPeer(otheAddress);
    return peer;
  }

  /**
   * 由于某些未知错误暂时不知怎么解决，加个节点重连
   * Failed to execute 'setRemoteDescription' on 'RTCPeerConnection': Failed to set remote offer sdp: Failed to apply the description for 0: Failed to setup RTCP mux.
   * @param otheAddress
   */
  reslaunch(otheAddress: string) {
    this._pool.remove(otheAddress);
    return this.launch(otheAddress);
  }

  /**
   * 注册对应的逻辑处理事件
   */
  private peerBindSendEvent(peer: PeerMain) {
    if (peer.hasBindEvent) return;
    peer.hasBindEvent = true;
    peer.on("sendAnswer", ({ to, from, blocks, bridgeAddress }) => {
      this.signalSend(to, from, blocks, bridgeAddress);
    });
    peer.on("sendOffer", ({ to, from, blocks, bridgeAddress }) => {
      this.signalSend(to, from, blocks, bridgeAddress);
    });
    peer.on("sendCandidate", ({ to, from, blocks, bridgeAddress }) => {
      this.signalSend(to, from, blocks, bridgeAddress);
    });
    peer.on("closed", () => {
      this.emit("peerClosed", peer);
    });
    peer.on("destroyed", () => {
      this._pool.remove(peer.to);
    });
    peer.on("connected", () => {
      this.emit("peerConnected", peer);
    });
    peer.on("datachannel", () => {
      /**
       * 节点扫描
       */
      // this.scanAddressList();
    });
    peer.on("message", (e) => {
      const data = e.data;
      let typeArr = new Uint8Array(data, 0, 1);
      console.info("MsgTypes:", MsgTypes[typeArr[0]]);
      switch (typeArr[0]) {
        case MsgTypes.ADDRESS_TABLE:
          this.onAddressTable(data);
          break;
        case MsgTypes.BRIDGE:
          this.onBridge(data);
          break;
        case MsgTypes.BUSINESS:
          this._onMainBusiness && this._onMainBusiness(data);
          break;
        case MsgTypes.BUSINESS_BEFORE:
          this._onMainBusinessBefore && this._onMainBusinessBefore(data);
          break;
      }
    });
  }

  _onMainBusiness!: (this: MainPeerHelper, buffer: ArrayBuffer) => void;
  _onMainBusinessBefore!: (this: MainPeerHelper, buffer: ArrayBuffer) => void;

  /**
   * 注册主通道接收函数
   * @param fn
   */
  registerMainBusiness(
    fn: (this: MainPeerHelper, buffer: ArrayBuffer) => void
  ) {
    this._onMainBusiness = fn;
  }

  /**
   * 注册用户通道接收函数
   * @param fn
   */
  registerMainBusinessBefore(
    fn: (this: MainPeerHelper, buffer: ArrayBuffer) => void
  ) {
    this._onMainBusinessBefore = fn;
  }

  /**
   * 信令发送服务
   * 服务节点模式 使用 socket 传输
   * 本地节点模式 使用 rtc 传输
   */
  private signalSend(
    to: string,
    from: string,
    blocks: IDataBlock[],
    bridgeAddress?: string
  ) {
    if (bridgeAddress) {
      /**
       * 桥接数据转发 采用数据打包后发送 减少转发次数
       */
      let model = new BridegMessage({
        receiver: to,
        to: bridgeAddress,
        from: from,
        path: [this.address],
        data: packForwardBlocks(blocks),
      });
      let sendArr = encodeMessage(MsgTypes.BRIDGE, model);
      this.send(model.to, sendArr);
    } else {
      this.socket.send(to, from, blocks);
    }
  }

  private answer(otherAddress: string) {
    let peer = this._pool.get(otherAddress);
    if (peer.connectionState !== "new") peer.create();
    this.peerBindSendEvent(peer);
  }

  /**
   * 处理接收到的信令
   */
  private onSignal(
    type: DataBlockType,
    buffer: ArrayBuffer,
    otherAddress: string,
    bridgeAddress?: string
  ) {
    let peer;
    switch (type) {
      case DataBlockType.OFFER:
        this.answer(otherAddress);
        peer = this._pool.get(otherAddress);
        peer.bridgeAddress = bridgeAddress;
        peer.offerHandler(
          PeerDescription.decode(new Uint8Array(buffer)).toJSON(),
          otherAddress
        );
        break;
      case DataBlockType.ANSWER:
        peer = this._pool.get(otherAddress);
        this.peerBindSendEvent(peer);
        peer.answerHandler(
          PeerDescription.decode(new Uint8Array(buffer)).toJSON()
        );
        break;
      case DataBlockType.CANDIDATE:
        peer = this._pool.get(otherAddress);
        this.peerBindSendEvent(peer);
        peer.candidateHandler(
          PeerCandidate.decode(new Uint8Array(buffer)).toJSON()
        );
        break;
    }
  }

  send(otherAddress: string, data: ArrayBuffer) {
    let peer = this._pool.get(otherAddress);
    if (!peer!.connected) return;
    peer.channelSend(data);
  }

  /**
   * ADDRESS_TABLE类型的处理方法
   * @param data
   */
  private onAddressTable(data: ArrayBuffer) {
    let dataArr = new Uint8Array(data, 1);
    let msg = decodeMessage(MsgTypes.ADDRESS_TABLE, dataArr);
    msg.type === AddressTableTypeMessage.REQUEST;
    switch (msg.type) {
      /**
       * 发送自己的路由表
       */
      case AddressTableTypeMessage.REQUEST:
        this.addressTableRequest(msg);
        break;
      /**
       * 接收到路由表后 更新自己的连接
       */
      case AddressTableTypeMessage.RESPONSE:
        this.addressTableResponse(msg);
        break;
    }
  }

  /**
   * BRIDGE类型的处理方法
   */
  private onBridge(data: ArrayBuffer) {
    let dataArr = new Uint8Array(data, 1);
    let msg = decodeMessage(MsgTypes.BRIDGE, dataArr);
    let path = msg.path;
    path.push(this.address);
    /**
     * 不是自己的消息 将消息转发出去
     */
    if (msg.receiver !== this.address) {
      let model = new BridegMessage({
        receiver: msg.receiver,
        to: msg.receiver,
        from: this.address,
        path: path,
        data: msg.data,
      });
      let sendArr = encodeMessage(MsgTypes.BRIDGE, model);
      this.send(model.to, sendArr);
      return;
    }
    console.info("path:", msg.path);
    let otherAddress = msg.path[0]; // 数据发送者
    unpackForwardBlocks(
      pickTypedArrayBuffer(msg.data),
      ({ type, payload: buffer }) => {
        console.info(
          `收到 ${msg.path[0]} => ${msg.path[msg.path.length - 1]} 类型 ${
            DataBlockType[type]
          }`
        );
        this.onSignal(type, buffer, otherAddress, msg.from);
      }
    );
  }

  /**
   * 扫描地址表
   */
  scanAddressList() {
    console.info("开始扫描了");
    let list = this.getPeerList()
      .filter(([_, peer]) => peer.connected)
      .map(([key]) => key);
    for (let index = 0; index < list.length; index++) {
      const addr = list[index];
      this.scanByAddress(addr);
    }
  }

  /**
   * 根据address获取 地址表
   */
  scanByAddress(addr: string) {
    let model = new AddressTableMessage({
      type: AddressTableTypeMessage.REQUEST,
      from: this.address,
      to: addr,
    });
    let uint = encodeMessage(MsgTypes.ADDRESS_TABLE, model);
    this.send(model.to, uint);
  }

  /**
   * 发送自己的地址表
   */
  private addressTableRequest(msg: AddressTableMessage) {
    let list = this.getPeerList()
      .filter(([_, peer]) => peer.connected)
      .map(([key]) => key);
    let model = new AddressTableMessage({
      addressList: list,
      type: AddressTableTypeMessage.RESPONSE,
      from: msg.to,
      to: msg.from,
    });
    let uint = encodeMessage(MsgTypes.ADDRESS_TABLE, model);
    this.send(model.to, uint);
  }

  /**
   * 收到地址表后 逐个发起连接
   */
  private addressTableResponse(msg: AddressTableMessage) {
    let list = this.getPeerList().map(([key]) => key);
    list.push(this.address);
    let diffArr = arrayDiff(list, msg.addressList);
    console.info("发现节点：", diffArr);
    if (diffArr.length === 0) return;
    for (let index = 0; index < diffArr.length; index++) {
      const addr = diffArr[index];
      this.launch(addr, msg.from);
    }
  }
}

export const mainPeerHelper = MainPeerHelper.instance;
