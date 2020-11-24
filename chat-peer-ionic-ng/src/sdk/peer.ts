import { PeerDescription, IDataBlock, PeerCandidate, DataBlockType, PeerServer } from "chat-peer-models";
import { EmitType, Subscribe } from "./subscribe";

export class Peer {
  rtcPeer: RTCPeerConnection;
  channel: RTCDataChannel;
  from: string;
  to: string;
  private subscribe: Subscribe;
  constructor(address: string) {
    this.from = address;
    this.rtcPeer = new RTCPeerConnection({
      iceServers: [
        {
          urls: [
            // "stun:stun1.l.google.com:19302",
            // "stun:stun2.l.google.com:19302",
            // "stun:stun3.l.google.com:19302",
            // "stun:stun4.l.google.com:19302",
            // "stun:s331835e69.zicp.vip:8865",
          ],
        },
        {
          urls: "turn:s331835e69.zicp.vip:8865",
          username: "test",
          credential: "test123456789",
        },
      ],
    });

    this.peerEvent();
    this.subscribe = new Subscribe();
  }

  get connectionState() {
    return this.rtcPeer.connectionState;
  }

  server: PeerServer;

  private emit(type: EmitType, data?: unknown) {
    this.subscribe.emit(type, data);
  }

  on(type: EmitType, fn) {
    this.subscribe.on(type, fn);
  }

  once(type: EmitType, fn) {
    this.subscribe.once(type, fn);
  }

  registerServer(server: PeerServer) {
    this.server = server;
  }

  private peerEvent() {
    this.rtcPeer.onconnectionstatechange = () => {
      console.info(this.rtcPeer.connectionState);
      switch (this.rtcPeer.connectionState) {
        case "new":
          break;
        case "closed":
          this.emit("closed");
          break;
        case "connecting":
          break;
        case "connected":
          this.emit("connected");
          break;
        case "disconnected":
          this.emit("disconnected");
          break;
        case "failed":
          this.emit("failed");
          this.destroy();
          break;
        default:
          break;
      }
      // RTCPeerConnectionState
    };

    this.rtcPeer.onicecandidateerror = (e: RTCPeerConnectionIceErrorEvent) => {
      console.error("RTCPeerConnectionIceErrorEvent", e);
    };

    /**
     * 描述 事件
     */
    this.rtcPeer.onicecandidate = (event: RTCPeerConnectionIceEvent) => {
      if (event.candidate) {
        this.sendCandidate(event.candidate);
      }
    };

    this.rtcPeer.ontrack = (e: RTCTrackEvent) => {
      console.info("ontrack", e);
      this.subscribe.emit("track", e);
    };

    /**
     * 被动接收消息
     */
    this.rtcPeer.ondatachannel = (event) => {
      let channel = event.channel;
      channel.onmessage = (event: MessageEvent<ArrayBuffer>) => {
        console.info(event.data);
        this.subscribe.emit("message", event);
      };
    };

    this.channel = this.rtcPeer.createDataChannel(this.from);
    this.channel.onmessage = (event: MessageEvent<ArrayBuffer>) => {
      console.info(event.data);
      this.subscribe.emit("message", event);
    };
  }

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
  async launchPeer(address: string) {
    this.to = address;
    await this.createOffer();
    this.sendOffer();
  }

  /**
   * 接收到 offer 后 下个执行步骤
   */
  async offerHandler(description: RTCSessionDescriptionInit, from: string) {
    this.to = from;
    await this.rtcPeer.setRemoteDescription(description);
    await this.createAnswer();
    this.sendAnswer();
  }

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
    let offer = await this.rtcPeer.createOffer();
    await this.rtcPeer.setLocalDescription(offer);
  }

  /**
   * 创建 answer 应答
   */
  private async createAnswer() {
    let answer = await this.rtcPeer.createAnswer();
    await this.rtcPeer.setLocalDescription(answer);
  }

  private async send(block: IDataBlock) {
    if (!this.server) throw new Error("please register for PeerServer service");
    await this.server.send(this.to, this.from, [block]);
  }

  /**
   * 发送呼叫 信令
   */
  private sendOffer() {
    let offer = this.rtcPeer.localDescription;
    if (!offer) {
      throw new Error("offer not found");
    }

    let peerDescription = new PeerDescription({
      type: offer.type,
      sdp: offer.sdp,
    });
    let uintArr = PeerDescription.encode(peerDescription).finish();

    this.emit("sendOffer", {
      to: this.to,
      from: this.from,
      block: { type: DataBlockType.OFFER, payload: uintArr },
    });

    // this.send({ type: DataBlockType.OFFER, payload: uintArr });

    console.info(`sendOffer 发送呼叫`, offer);
  }

  /**
   * 发送回应信令
   */
  private sendAnswer() {
    let answer = this.rtcPeer.localDescription;
    if (!answer) {
      throw new Error("answer not found");
    }

    let peerDescription = new PeerDescription({
      type: answer.type,
      sdp: answer.sdp,
    });
    let uintArr = PeerDescription.encode(peerDescription).finish();

    // this.send({ type: DataBlockType.ANSWER, payload: uintArr });

    this.emit("sendAnswer", {
      to: this.to,
      from: this.from,
      block: { type: DataBlockType.ANSWER, payload: uintArr },
    });

    console.info(`sendAnswer 发送回应`, answer);
  }

  /**
   * 发送候选者描述
   * @param candidate
   */
  private sendCandidate(candidate: RTCIceCandidate) {
    let peerCandidate = new PeerCandidate({
      candidate: candidate.candidate,
      sdpMLineIndex: candidate.sdpMLineIndex as number,
      sdpMid: candidate.sdpMid as string,
      usernameFragment: candidate.usernameFragment as string,
    });
    let uintArr = PeerCandidate.encode(peerCandidate).finish();

    this.emit("sendCandidate", {
      to: this.to,
      from: this.from,
      block: { type: DataBlockType.CANDIDATE, payload: uintArr },
    });

    // this.send({ type: DataBlockType.CANDIDATE, payload: uintArr });

    console.info(`sendCandidate 发送描述`, candidate);
  }

  destroy() {
    this.rtcPeer.close();
    this.subscribe.destroy();
  }
}
