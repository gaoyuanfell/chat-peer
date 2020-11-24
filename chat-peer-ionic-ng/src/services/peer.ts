import { PeerDescription, IDataBlock, PeerCandidate } from "chat-peer-models";
import { DataBlockType } from "src/common/enum";
import { PeerServer } from "./socket.service";

export class Peer {
  peer: RTCPeerConnection;
  channel: RTCDataChannel;
  from: string;
  to: string;
  constructor(address: string) {
    this.from = address;
    this.peer = new RTCPeerConnection({
      iceServers: [
        {
          urls: [
            "stun:stun1.l.google.com:19302",
            "stun:stun2.l.google.com:19302",
            "stun:stun3.l.google.com:19302",
            "stun:stun4.l.google.com:19302",
            "stun:s331835e69.zicp.vip:8865",
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
  }

  server: PeerServer;

  registerServer(server: PeerServer) {
    this.server = server;
  }

  private peerEvent() {
    this.peer.onconnectionstatechange = () => {
      console.info(this.peer.connectionState);
    };

    this.peer.onicecandidateerror = (e: RTCPeerConnectionIceErrorEvent) => {
      console.error("RTCPeerConnectionIceErrorEvent", e);
    };

    /**
     * 描述 事件
     */
    this.peer.onicecandidate = (event: RTCPeerConnectionIceEvent) => {
      if (event.candidate) {
        this.sendCandidate(event.candidate);
      }
    };

    this.peer.ontrack = (e: RTCTrackEvent) => {
      console.info("ontrack", e);
      this._onTrack && this._onTrack(e);
    };

    this.channel = this.peer.createDataChannel(this.from);
    this.channel.onmessage = (event: MessageEvent<ArrayBuffer>) => {
      console.info(event.data);
      this._onMessage && this._onMessage(event);
    };
  }

  _onMessage: (ev: MessageEvent<any>) => any;
  onMessage(fn) {
    this._onMessage = fn;
  }
  _onTrack: (ev: RTCTrackEvent) => any;
  onTrack(fn) {
    this._onTrack = fn;
  }

  eventRef(): any[] {
    return [this.onMessage.bind(this), this.onTrack.bind(this)];
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
  async offerHandler(description: RTCSessionDescriptionInit) {
    await this.peer.setRemoteDescription(description);
    await this.createAnswer();
    this.sendAnswer();
  }

  /**
   * 接收到 answer 后 下个执行步骤
   */
  async answerHandler(description: RTCSessionDescriptionInit) {
    await this.peer.setRemoteDescription(description);
  }

  /**
   * 接收到 candidate 描述 个执行步骤
   * @param candidate
   */
  async candidateHandler(candidate: RTCIceCandidateInit) {
    await this.peer.addIceCandidate(candidate);
  }

  /**
   * 创建 offer 呼叫
   */
  private async createOffer() {
    let offer = await this.peer.createOffer();
    await this.peer.setLocalDescription(offer);
  }

  /**
   * 创建 answer 应答
   */
  private async createAnswer() {
    let answer = await this.peer.createAnswer();
    await this.peer.setLocalDescription(answer);
  }

  private async send(block: IDataBlock) {
    if (!this.server) throw new Error("please register for PeerServer service");
    await this.server.send(this.to, [block]);
  }

  /**
   * 发送呼叫 信令
   */
  private sendOffer() {
    let offer = this.peer.localDescription;
    if (!offer) {
      throw new Error("offer not found");
    }

    let peerDescription = new PeerDescription({
      type: offer.type,
      sdp: offer.sdp,
    });
    let uintArr = PeerDescription.encode(peerDescription).finish();

    this.send({ type: DataBlockType.OFFER, payload: uintArr });

    console.info(`sendOffer 发送呼叫`, offer);
  }

  /**
   * 发送回应信令
   */
  private sendAnswer() {
    let answer = this.peer.localDescription;
    if (!answer) {
      throw new Error("answer not found");
    }

    let peerDescription = new PeerDescription({
      type: answer.type,
      sdp: answer.sdp,
    });
    let uintArr = PeerDescription.encode(peerDescription).finish();

    this.send({ type: DataBlockType.ANSWER, payload: uintArr });

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
    this.send({ type: DataBlockType.CANDIDATE, payload: uintArr });
    console.info(`sendCandidate 发送描述`, candidate);
  }

  destroy() {}
}
