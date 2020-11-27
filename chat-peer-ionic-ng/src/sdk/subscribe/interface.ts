import { IDataBlockTransport } from "chat-peer-models";

export interface ISubscribe<Q> {
  emit<T extends keyof Q>(type: T, data?: Q[T]);

  on<T extends keyof Q>(type: T, listener: (this: ISubscribe<Q>, ev: Q[T]) => any);

  once<T extends keyof Q>(type: T, listener: (this: ISubscribe<Q>, ev: Q[T]) => any);

  clear();
}

export interface EmitTypeBaseMap {
  connected: Event;
  connecting: Event;
  disconnected: Event;
  failed: Event;
  new: Event;
  closed: any;
  icegatheringstatechange: RTCIceGatheringState;
  signalingstatechange: RTCSignalingState;
  iceconnectionstatechange: RTCIceConnectionState;
  connectionstatechange: RTCPeerConnectionState;
  icecandidateerror: RTCPeerConnectionIceErrorEvent;
  icecandidate: RTCPeerConnectionIceEvent;
  datachannel: RTCDataChannelEvent;
  message: MessageEvent<ArrayBuffer>;
}

// 主通道专用
export interface EmitTypeMainMap extends EmitTypeBaseMap {
  sendOffer: IDataBlockTransport;
  sendAnswer: IDataBlockTransport;
  sendCandidate: IDataBlockTransport;
}

// 业务通道peer专用
export interface EmitTypeBusMap extends EmitTypeBaseMap {
  sendOffer: ArrayBuffer;
  sendAnswer: ArrayBuffer;
  sendCandidate: ArrayBuffer;
  track: RTCTrackEvent;
}

export type EmitTypeMain = Partial<EmitTypeMainMap>;

export type EmitTypeBus = Partial<EmitTypeBusMap>;
