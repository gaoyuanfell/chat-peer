import {
  AddressTableMessage,
  AddressTableTypeMessage,
  DataBlockType,
  decodeMessage,
  encodeMessage,
  MsgTypes,
  PeerCandidate,
  PeerDescription,
  PeerServer,
} from "chat-peer-models";
import { Peer } from "./peer";
import { Pool } from "./pool";
import { SocketService } from "./socket";

const peerHelperSymbol = Symbol("PeerHelper");
export class PeerHelper {
  #pool: Pool;
  #socket: SocketService;

  constructor() {
    if (!PeerHelper[peerHelperSymbol]) {
      PeerHelper[peerHelperSymbol] = this;
    }
    return PeerHelper[peerHelperSymbol];
  }

  [peerHelperSymbol]: PeerHelper;

  static get instance() {
    return new PeerHelper();
  }

  getPeer(address: string) {
    if (!address) throw new Error("address connot be empty");
    return this.#pool.get(address);
  }

  get address() {
    return this.#pool!.address;
  }

  getPeerList() {
    return this.#pool.getAll();
  }

  /**
   * 获取所有连接的地址表
   */
  getAddressList() {}

  /**
   * 等待连接
   */
  waitingConnection(address: string) {
    this.#pool = new Pool(address);

    /**
     * 信令服务 socket
     */
    this.#socket = new SocketService();
    this.#socket.connent().then(() => {
      let uint = encodeMessage(MsgTypes.LOGIN, {
        address: address,
      });
      this.#socket.wssSend(uint);
    });

    this.#socket.onMessage = ({ type, buffer, from }) => {
      let peer: Peer = this.#pool.get(from);
      this.peerBindSendServer(peer);
      switch (type) {
        case DataBlockType.OFFER:
          peer.offerHandler(PeerDescription.decode(new Uint8Array(buffer)).toJSON(), from);
          break;
        case DataBlockType.ANSWER:
          peer.answerHandler(PeerDescription.decode(new Uint8Array(buffer)).toJSON());
          break;
        case DataBlockType.CANDIDATE:
          peer.candidateHandler(PeerCandidate.decode(new Uint8Array(buffer)).toJSON());
          break;
      }
    };
  }

  /**
   * 主动发起连接
   */
  launch(receiver: string) {
    if (this.address === receiver) return;
    let peer: Peer = this.#pool.get(receiver);
    if (peer.connected) return;
    this.peerBindSendServer(peer);
    peer.launchPeer(receiver);
  }

  private peerBindSendServer(peer: Peer) {
    if (!peer.hasBindEvent) {
      peer.hasBindEvent = true;
      peer.on("sendAnswer", ({ to, from, block }) => {
        this.#socket.send(to, from, [block]);
      });
      peer.on("sendOffer", ({ to, from, block }) => {
        this.#socket.send(to, from, [block]);
      });
      peer.on("sendCandidate", ({ to, from, block }) => {
        this.#socket.send(to, from, [block]);
      });
      peer.on("closed", () => {
        console.info("closed");
        this.#pool.remove(peer.to);
      });

      peer.on("message", (e) => {
        const data = e.data;
        let typeArr = new Uint8Array(data, 0, 1);
        console.info(MsgTypes[typeArr[0]]);
        switch (typeArr[0]) {
          case MsgTypes.ADDRESS_TABLE:
            this.onAddressTable(data);
            break;
          case MsgTypes.BRIDGE:
            this.onBridge(data);
            break;
        }
      });
    }
  }

  create(address: string) {
    this.waitingConnection(address);
  }

  /**
   * 桥接数据转发 采用数据打包后发送 减少转发次数
   */
  transport() {}

  send(receiver: string, data: ArrayBuffer) {
    let peer: Peer = this.#pool.get(receiver);
    if (!peer!.connected) return;
    peer.channelSend(data);
  }

  onAddressTable(data: ArrayBuffer) {
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
    console.info(msg);
  }

  private addressTableRequest(msg: AddressTableMessage) {
    let list = this.getPeerList().map(([key]) => key);
    let model = new AddressTableMessage({
      addressList: list,
      type: AddressTableTypeMessage.RESPONSE,
    });
    let uint = encodeMessage(MsgTypes.ADDRESS_TABLE, model);
    this.send(msg.receiver, uint);
  }

  // TODO
  private addressTableResponse(msg: AddressTableMessage) {
    let list = this.getPeerList().map(([key]) => key);

    console.info(msg.addressList);
  }

  onBridge(data: ArrayBuffer) {
    let dataArr = new Uint8Array(data, 1);
    let msg = decodeMessage(MsgTypes.BRIDGE, dataArr);
    console.info(msg);
  }
}
