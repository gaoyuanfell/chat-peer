import {
  DataBlockType,
  decodeMessage,
  encodeMessage,
  IDataBlock,
  MsgTypes,
  PeerCandidate,
  PeerDescription,
  pickTypedArrayBuffer,
  TransferMessage,
  unpackForwardBlocks,
} from "chat-peer-models";
import { PeerBus } from "../peer";
import { BusPool } from "../pool";
import { EmitTypeBusHelper, Subscribe } from "../subscribe";
import { MainPeerHelper } from "./main-peer.helper";
import { peerSubscribe } from "./peer-subscribe";

const busPeerHelperSymbol = Symbol("BusPeerHelper");
export class BusPeerHelper extends Subscribe<EmitTypeBusHelper> {
  [busPeerHelperSymbol]: BusPeerHelper;

  private _pool!: BusPool;

  get pool() {
    return this._pool;
  }

  get address() {
    return this._pool!.address;
  }

  constructor() {
    super();
    if (!(BusPeerHelper as any)[busPeerHelperSymbol]) {
      (BusPeerHelper as any)[busPeerHelperSymbol] = this;
    }
    return (BusPeerHelper as any)[busPeerHelperSymbol];
  }

  static get instance() {
    return new BusPeerHelper();
  }

  createPool(address: string) {
    this._pool = new BusPool(address);

    peerSubscribe.on("onMainBusiness", (buffer: ArrayBuffer) => {
      this.onMainBusiness(buffer);
    });

    peerSubscribe.on("onMainBusinessBefore", (buffer: ArrayBuffer) => {
      this.onMainBusinessBefore(buffer);
    });
  }

  // 主通道消息
  onMainBusiness(buffer: ArrayBuffer) {
    let dataArr = new Uint8Array(buffer, 1);
    let msg = decodeMessage(MsgTypes.BUSINESS, dataArr);
    unpackForwardBlocks(
      pickTypedArrayBuffer(msg.data),
      ({ type, payload: buffer }) => {
        this.onSignal(type, buffer, msg.from, msg.businessId);
      }
    );
  }

  // 用户主动发送的业务消息  主通道消息
  onMainBusinessBefore(buffer: ArrayBuffer) {
    let dataArr = new Uint8Array(buffer, 1);
    let msg = decodeMessage(MsgTypes.BUSINESS_BEFORE, dataArr);

    this.emit("mainMessage", {
      buffer: pickTypedArrayBuffer(msg.data),
      otherAddress: msg.from,
    });
  }

  /**
   * 通过主通道给对方发送消息
   * @param otherAddress
   * @param data
   */
  send(otherAddress: string, data: ArrayBuffer) {
    let mainPeer = MainPeerHelper.instance.getPeer(otherAddress);
    if (!mainPeer.connected) throw new Error("peer is not connected");
    let model = new TransferMessage({
      to: otherAddress,
      from: this.address,
      data: new Uint8Array(data),
    });
    mainPeer.channelSend(encodeMessage(MsgTypes.BUSINESS_BEFORE, model));
  }

  /**
   * 获取对应业务peer
   */
  getBusPeer(otherAddress: string, businessId: string) {
    return this._pool.get(otherAddress, businessId);
  }

  /** // TODO 修改 case DataBlockType.OFFER:
   * 处理接收到的信令
   */
  private onSignal(
    type: DataBlockType,
    buffer: ArrayBuffer,
    otherAddress: string,
    businessId: string
  ) {
    let peer = this._pool.get(otherAddress, businessId);
    console.info("DataBlockType", DataBlockType[type]);
    switch (type) {
      case DataBlockType.OFFER:
        this.answer(otherAddress, businessId);
        peer.offerHandler(
          PeerDescription.decode(new Uint8Array(buffer)).toJSON(),
          otherAddress
        );
        break;
      case DataBlockType.ANSWER:
        peer.answerHandler(
          PeerDescription.decode(new Uint8Array(buffer)).toJSON()
        );
        break;
      case DataBlockType.CANDIDATE:
        peer.candidateHandler(
          PeerCandidate.decode(new Uint8Array(buffer)).toJSON()
        );
        break;
    }
  }

  offer(otherAddress: string, businessId: string) {
    let mainPeer = MainPeerHelper.instance.getPeer(otherAddress);
    if (!mainPeer.connected) throw new Error("mainPeer is not connected");
    let peer = this._pool.get(otherAddress, businessId);
    this.peerBindSendEvent(peer, otherAddress);
    peer.launchPeer(otherAddress);
    return peer;
  }

  answer(otherAddress: string, businessId: string) {
    let mainPeer = MainPeerHelper.instance.getPeer(otherAddress);
    if (!mainPeer.connected) throw new Error("mainPeer is not connected");
    let peer = this._pool.get(otherAddress, businessId);
    this.peerBindSendEvent(peer, otherAddress);
    return peer;
  }

  private peerBindSendEvent(peer: PeerBus, otherAddress: string) {
    if (peer.hasBindEvent) return;
    peer.hasBindEvent = true;
    let mainPeer = MainPeerHelper.instance.getPeer(otherAddress);
    peer.on("sendOffer", (buffer) => {
      mainPeer.channelSend(buffer);
    });
    peer.on("sendAnswer", (buffer) => {
      mainPeer.channelSend(buffer);
    });
    peer.on("sendCandidate", (buffer) => {
      mainPeer.channelSend(buffer);
    });
    peer.on("track", (event) => {
      this.emit("track", event);
    });
    peer.on("message", (event) => {
      this.emit("message", event);
      console.info(event.data);
    });
    peer.on("closed", () => {
      this._pool.remove(peer.to, peer.businessId);
      this.emit("closed");
    });
  }
}

export const busPeerHelper = BusPeerHelper.instance;
