import {
  DataBlockType,
  decodeMessage,
  MsgTypes,
  PeerCandidate,
  PeerDescription,
  pickTypedArrayBuffer,
  unpackForwardBlocks,
} from "chat-peer-models";
import { BusPool } from "./bus-pool";
import { PeerHelper } from "./peer.helper";
import { PeerBus } from "./peer/bus-peer";

const busPeerHelperSymbol = Symbol("BusPeerHelper");
export class BusPeerHelper {
  [busPeerHelperSymbol]: BusPeerHelper;

  #pool: BusPool;

  constructor() {
    if (!BusPeerHelper[busPeerHelperSymbol]) {
      BusPeerHelper[busPeerHelperSymbol] = this;
    }
    return BusPeerHelper[busPeerHelperSymbol];
  }

  static get instance() {
    return new BusPeerHelper();
  }

  create(address: string) {
    this.#pool = new BusPool(address);
  }

  // 组通道消息
  onMainMessage(buffer: ArrayBuffer) {
    let dataArr = new Uint8Array(buffer, 1);
    let msg = decodeMessage(MsgTypes.BUSINESS, dataArr);
    unpackForwardBlocks(pickTypedArrayBuffer(msg.data), ({ type, buffer }) => {
      this.onSignal(type, buffer, msg.from, msg.businessId);
    });
  }

  /**
   * 处理接收到的信令
   */
  private async onSignal(type: DataBlockType, buffer: ArrayBuffer, otherAddress: string, businessId: string) {
    let peer = this.#pool.get(otherAddress, businessId);
    console.info("DataBlockType", DataBlockType[type]);
    switch (type) {
      case DataBlockType.OFFER:
        await this.answer(otherAddress, businessId);
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

  async call(otherAddress: string, constraints: MediaStreamConstraints = { audio: true, video: true }) {
    let mainPeer = PeerHelper.instance.getPeer(otherAddress);
    if (!mainPeer.connected) throw new Error("peer is not connected");
    let stream; //= await navigator.mediaDevices.getUserMedia(constraints);

    let businessId = Math.random().toString();
    let peer = this.#pool.get(otherAddress, businessId);
    this.peerBindSendEvent(peer, otherAddress);
    peer.addTrack(stream);
    peer.launchPeer(otherAddress);
    return {
      stream,
      peer,
    };
  }

  async answer(
    otherAddress: string,
    businessId: string,
    constraints: MediaStreamConstraints = { audio: true, video: true }
  ) {
    let mainPeer = PeerHelper.instance.getPeer(otherAddress);
    if (!mainPeer.connected) throw new Error("peer is not connected");
    let stream; //= await navigator.mediaDevices.getUserMedia(constraints);
    let peer = this.#pool.get(otherAddress, businessId);
    this.peerBindSendEvent(peer, otherAddress);
    peer.addTrack(stream);
    return {
      stream,
      peer,
    };
  }

  private peerBindSendEvent(peer: PeerBus, otherAddress: string) {
    if (peer.hasBindEvent) return;
    peer.hasBindEvent = true;
    let mainPeer = PeerHelper.instance.getPeer(otherAddress);
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
      console.info("track", event);
    });
    peer.on("message", (event) => {
      console.info("message", event.data);
    });
    peer.on("closed", () => {
      this.#pool.remove(peer.to, peer.businessId);
    });
  }
}
