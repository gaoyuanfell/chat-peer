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
import { peerSubscribe } from "./peer-subscribe";

const peerHelperSymbol = Symbol("PeerHelper");
export class MainPeerHelper extends Subscribe<EmitTypeMainHelper> {
  #pool: Pool;
  #socket: SocketService;
  [peerHelperSymbol]: MainPeerHelper;

  constructor() {
    super();
    if (!MainPeerHelper[peerHelperSymbol]) {
      MainPeerHelper[peerHelperSymbol] = this;
    }
    return MainPeerHelper[peerHelperSymbol];
  }

  static get instance() {
    return new MainPeerHelper();
  }

  has(address: string) {
    if (!address) throw new Error("address connot be empty");
    return this.#pool.has(address);
  }

  getPeer(address: string) {
    if (!address) throw new Error("address connot be empty");
    return this.#pool.get(address);
  }

  get pool() {
    return this.#pool;
  }

  get address() {
    return this.#pool!.address;
  }

  getPeerList() {
    if (!this.#pool) return [];
    return this.#pool.getAll(); //.filter(([_, peer]) => peer.connected);
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
    // if (!this.#socket) throw new Error("the main pipe must be connected");
    return this.#socket;
  }

  // get pool() {
  //   if (!this.#pool) throw new Error("method waitingConnection needs to be executed first");
  //   return this.#pool;
  // }

  /**
   * 等待连接
   */
  waitingConnection(address: string) {
    return new Promise<boolean>((resolve, reject) => {
      this.#pool = new Pool(address);
      /**
       * 信令服务 socket
       */
      this.#socket = new SocketService();
      this.#socket.connent().then(
        () => {
          let uint = encodeMessage(MsgTypes.LOGIN, {
            address: address,
          });
          this.#socket.wssSend(uint);
          resolve(true);
        },
        () => {
          reject(false);
        }
      );
      this.#socket.onClose = () => {
        reject(false);
      };
      this.#socket.onMessage = ({ type, buffer, otherAddress }) => {
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
    if (this.address === otheAddress) throw new Error(`you can't connect to yourself`);
    let peer = this.#pool.get(otheAddress);
    if (peer.connected) return peer;
    this.peerBindSendEvent(peer);
    peer.bridgeAddress = bridgeAddress;
    peer.launchPeer(otheAddress);
    return peer;
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
      this.#pool.remove(peer.to);
      this.emit("peerClosed", peer);
    });
    peer.on("connected", () => {
      this.emit("peerConnected", peer);
    });
    peer.on("datachannel", () => {
      /**
       * 节点扫描
       */
      this.scanAddressList();
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
          peerSubscribe.emit("onMainBusiness", data);
          // BusPeerHelper.instance.onMainBusiness(data);
          break;
        case MsgTypes.BUSINESS_BEFORE:
          peerSubscribe.emit("onMainBusinessBefore", data);
          // BusPeerHelper.instance.onMainBusinessBefore(data);
          break;
      }
    });
  }

  /**
   * 信令发送服务
   * 服务节点模式 使用 socket 传输
   * 本地节点模式 使用 rtc 传输
   */
  private signalSend(to: string, from: string, blocks: IDataBlock[], bridgeAddress: string) {
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

  /**
   * 处理接收到的信令
   */
  private onSignal(type: DataBlockType, buffer: ArrayBuffer, otherAddress: string, bridgeAddress?: string) {
    let peer = this.#pool.get(otherAddress);
    this.peerBindSendEvent(peer);
    switch (type) {
      case DataBlockType.OFFER:
        peer.bridgeAddress = bridgeAddress;
        peer.offerHandler(PeerDescription.decode(new Uint8Array(buffer)).toJSON(), otherAddress);
        break;
      case DataBlockType.ANSWER:
        peer.answerHandler(PeerDescription.decode(new Uint8Array(buffer)).toJSON());
        break;
      case DataBlockType.CANDIDATE:
        peer.candidateHandler(PeerCandidate.decode(new Uint8Array(buffer)).toJSON());
        break;
    }
  }

  // create(address: string) {
  //   BusPeerHelper.instance.createPool(address);
  //   return this.waitingConnection(address);
  // }

  send(otherAddress: string, data: ArrayBuffer) {
    let peer = this.#pool.get(otherAddress);
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
    unpackForwardBlocks(pickTypedArrayBuffer(msg.data), ({ type, payload: buffer }) => {
      console.info(`收到 ${msg.path[0]} => ${msg.path[msg.path.length - 1]} 类型 ${DataBlockType[type]}`);
      this.onSignal(type, buffer, otherAddress, msg.from);
    });
  }

  /**
   * 扫描地址表
   */
  scanAddressList() {
    console.info("开始扫描了");
    let list = this.getPeerList().map(([key]) => key);
    for (let index = 0; index < list.length; index++) {
      const addr = list[index];
      let model = new AddressTableMessage({
        type: AddressTableTypeMessage.REQUEST,
        from: this.address,
        to: addr,
      });
      let uint = encodeMessage(MsgTypes.ADDRESS_TABLE, model);
      this.send(model.to, uint);
    }
  }

  /**
   * 发送自己的地址表
   */
  private addressTableRequest(msg: AddressTableMessage) {
    let list = this.getPeerList().map(([key]) => key);
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
