import {
  PeerDescription,
  PeerCandidate,
  DataBlockType,
  BusinessDataMessage,
  packForwardBlocks,
  encodeMessage,
  MsgTypes,
} from "chat-peer-models";
import { EmitType, Subscribe } from "../subscribe";

export abstract class Peer<T> extends Subscribe<T> {
  rtcPeer: RTCPeerConnection;
  channel: RTCDataChannel;
  from: string;
  to: string;
  hasBindEvent: boolean; // 是否监听过发送信令

  get connected() {
    return this.rtcPeer.connectionState === "connected";
  }

  constructor(address: string) {
    super();
    this.from = address;
    this.rtcPeer = new RTCPeerConnection({
      iceServers: [
        // {
        //   urls: [
        //     "stun:stun1.l.google.com:19302",
        //     "stun:stun2.l.google.com:19302",
        //     "stun:stun3.l.google.com:19302",
        //     "stun:stun4.l.google.com:19302",
        //     "stun:s331835e69.zicp.vip:8865",
        //   ],
        // },
        {
          urls: "turn:s331835e69.zicp.vip:8865",
          username: "test",
          credential: "test123456789",
        },
      ],
    });
    this.peerEvent();
  }

  abstract peerEvent();

  /**
   * p2p发送消息
   * @param data
   */
  channelSend(data: any) {
    if (this.channel && this.channel.readyState === "open") {
      this.channel.send(data);
    }
  }

  /**
   * 创建连接
   */
  abstract async launchPeer(address: string);

  /**
   * 接收到 offer 后 下个执行步骤
   */
  abstract async offerHandler(description: RTCSessionDescriptionInit, from: string);

  /**
   * 接收到 answer 后 下个执行步骤
   */
  async answerHandler(description: RTCSessionDescriptionInit) {
    await this.rtcPeer.setRemoteDescription(description);
  }

  /**
   * 接收到 candidate 描述 个执行步骤
   * @param candidate
   */
  async candidateHandler(candidate: RTCIceCandidateInit) {
    await this.rtcPeer.addIceCandidate(candidate);
  }

  /**
   * 创建 offer 呼叫
   */
  private async createOffer() {
    let option: RTCOfferOptions = {};
    if (this.rtcPeer.iceConnectionState !== "connected") {
      option.iceRestart = true;
    }
    let offer = await this.rtcPeer.createOffer(option);
    await this.rtcPeer.setLocalDescription(offer);
  }

  /**
   * 创建 answer 应答
   */
  private async createAnswer() {
    let answer = await this.rtcPeer.createAnswer();
    await this.rtcPeer.setLocalDescription(answer);
  }

  /**
   * 发送呼叫 信令
   */
  abstract sendOffer();

  /**
   * 发送回应信令
   */
  abstract sendAnswer();

  /**
   * 发送候选者描述
   * @param candidate
   */
  abstract sendCandidate(candidate: RTCIceCandidate);

  addTrack(stream: MediaStream) {
    if (!stream) return;
    stream.getTracks().forEach((track) => {
      this.rtcPeer.addTrack(track, stream);
    });
  }

  abstract close();

  private destroy() {
    this.clear();
  }
}
