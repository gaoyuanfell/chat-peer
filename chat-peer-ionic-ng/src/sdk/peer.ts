import { PeerDescription, IDataBlock, PeerCandidate, DataBlockType } from "chat-peer-models";
import { EmitType, Subscribe } from "./subscribe";

export class Peer {
  rtcPeer: RTCPeerConnection;
  channel: RTCDataChannel;
  from: string;
  to: string;
  private subscribe: Subscribe;
  hasBindSendServer: boolean; // 是否监听过发送信令

  get connectionState() {
    return this.rtcPeer.connectionState;
  }

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

  private emit(type: EmitType, data?: unknown) {
    this.subscribe.emit(type, data);
  }

  on(type: EmitType, fn) {
    this.subscribe.on(type, fn);
  }

  once(type: EmitType, fn) {
    this.subscribe.once(type, fn);
  }

  private peerEvent() {
    // 当ICE收集状态（即ICE代理是否正在积极收集候选者）发生更改时
    this.rtcPeer.onicegatheringstatechange = () => {
      /**
       * "new"	对等连接刚刚创建，尚未进行任何联网。
       * "gathering"	ICE代理正在收集连接候选者。
       * "complete"	ICE代理已完成候选人征集。如果发生需要收集新候选对象的情况，例如正在添加新接口或添加新ICE服务器，则状态将恢复为“聚集”以收集那些候选对象。
       */
      console.info("onicegatheringstatechange", this.rtcPeer.iceGatheringState);
    };

    // 当对等连接的signalingState更改
    this.rtcPeer.onsignalingstatechange = () => {
      /**
       * "stable"	目前没有进行中的要约和回答交换。这可能意味着该RTCPeerConnection对象是新对象，在这种情况下，localDescription和remoteDescription均为null；这也可能意味着协商已完成并且已建立连接。
       * "have-local-offer"	本地对等方调用RTCPeerConnection.setLocalDescription()，传入表示要约的SDP（通常是通过调用创建的RTCPeerConnection.createOffer()），并且要约已成功应用。
       * "have-remote-offer"	远程对等方创建了要约，并使用信令服务器将其传递给本地对等方，本地对等方通过调用将要约设置为远程描述RTCPeerConnection.setRemoteDescription()。
       * "have-local-pranswer"	已应用了远程对等方发送的要约，并已创建了答案（通常是通过呼叫RTCPeerConnection.createAnswer()）并通过呼叫应用了答案RTCPeerConnection.setLocalDescription()。此临时答案描述了受支持的媒体格式等，但可能没有包括完整的ICE候选集。其他候选人将在以后另行交付。
       * "have-remote-pranswer"	已收到临时答复并成功应用了该答复，以响应先前通过呼叫发送和建立的要约setLocalDescription()。
       * "closed"  连接已关闭。 注意：此值已移入规范的2016年5月13日的RTCPeerConnectionState枚举中，因为它反映的状态，而RTCPeerConnection不是信令连接。现在，检测通过检查关闭的连接为connectionState要"closed"代替。
       */
      console.info("onsignalingstatechange", this.rtcPeer.signalingState);
    };

    // 当连接的ICE代理的状态（以该iceConnectionState属性表示）改变时
    this.rtcPeer.oniceconnectionstatechange = () => {
      /**
       * "new"	ICE代理正在收集地址，或者正在等待通过RTCPeerConnection.addIceCandidate()（或同时）通过调用获得远程候选人。
       * "checking"	ICE代理已获得一个或多个远程候选，并正在相互检查本地和远程候选对，以尝试找到兼容的匹配项，但尚未找到允许进行对等连接的一对。候选人的聚集也可能还在进行中。
       * "connected"	已为连接的所有组件找到了可用的本地和远程候选者配对，并且已建立连接。收集工作可能仍在进行中，ICE代理也可能仍在相互检查候选人，以寻求更好的联系。
       * "completed"	ICE代理已完成收集候选项，相互检查了所有对，并找到了所有组件的连接。
       * "failed"	ICE候选者已经相互检查了所有候选对，并且未能找到连接的所有组件的兼容匹配项。但是，ICE代理可能确实找到了某些组件的兼容连接。
       * "disconnected"	检查以确保至少有一个组件仍然无法连接组件RTCPeerConnection。这比严格的测试要宽松一些，"failed"并且可能间歇性地触发并在可靠性较差的网络上或在临时断开连接时自发地解决。问题解决后，连接可能会返回到该"connected"状态。
       * "closed"	ICE代理RTCPeerConnection已关闭，不再处理请求。
       */
      console.info("iceConnectionState", this.rtcPeer.iceConnectionState);
    };

    this.rtcPeer.onconnectionstatechange = () => {
      /**
       * "new"	在连接的ICE运输（中至少一个RTCIceTransportS或RTCDtlsTransportS）是在"new"状态，他们都不是在以下状态之一："connecting"，"checking"，"failed"，或"disconnected"，或所有连接的传输都在"closed"状态。
       * "connecting"	当前，一个或多个ICE传输正在建立连接；也就是说，它们RTCIceConnectionState是"checking"或"connected"，并且该"failed"状态下没有任何传输。<<<一旦我知道将在何处记录此文件，将其链接
       * "connected"	连接使用的每个ICE传输都在使用中（状态"connected"或"completed"）或处于关闭状态（状态"closed"）；此外，至少一种运输方式为"connected"或"completed"。
       * "disconnected"	至少所述ICE传输用于连接的一个处于"disconnected"状态并且没有其他传输的处于状态"failed"，"connecting"或"checking"。
       * "failed"	连接上的一个或多个ICE传输处于"failed"状态。
       * "closed"	 将RTCPeerConnection被关闭。 该值一直存在于RTCSignalingState枚举中（因此通过读取的值可以找到signalingState），直到规范的2016年5月13日草案为止。
       */
      console.info("onconnectionstatechange", this.rtcPeer.connectionState);
      switch (this.rtcPeer.connectionState) {
        case "new":
          break;
        case "closed":
          this.emit("closed");
          this.destroy();
          break;
        case "connecting":
          break;
        case "connected":
          this.emit("connected");
          break;
        case "disconnected":
        case "failed":
          this.emit("disconnected");
          this.emit("failed");
          this.emit("closed");
          this.destroy();
          break;
      }
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
    console.info(`sendCandidate 发送描述`, candidate);
  }

  close() {
    this.rtcPeer.close();
    this.emit("closed");
    this.destroy();
  }

  private destroy() {
    this.subscribe.destroy();
  }
}
