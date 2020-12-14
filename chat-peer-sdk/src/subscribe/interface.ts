import { IDataBlockTransport } from "chat-peer-models";
import { PeerMain } from "../peer";

export interface ISubscribe<Q> {
  emit<T extends keyof Q>(type: T, data?: Q[T]): void;

  on<T extends keyof Q>(
    type: T,
    listener: (this: ISubscribe<Q>, ev: Q[T]) => any
  ): void;

  once<T extends keyof Q>(
    type: T,
    listener: (this: ISubscribe<Q>, ev: Q[T]) => any
  ): void;

  delete<T extends keyof Q>(
    type: T,
    listener: (this: ISubscribe<Q>, ev: Q[T]) => any
  ): void;

  clear(): void;
}

export interface EmitTypeBaseMap {
  connected: Event;
  connecting: Event;
  disconnected: Event;
  failed: Event;
  new: Event;
  closed: Event;
  destroyed: Event;
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

export interface EmitTypeBusHelperMap {
  track: RTCTrackEvent;
  message: MessageEvent<ArrayBuffer>;
  closed: Event;
  offer: {
    next: (constraints?: MediaStreamConstraints) => any;
    otherAddress: string;
    businessId: string;
  };
  mainMessage: {
    buffer: ArrayBuffer;
    otherAddress: string;
  };
}

export interface EmitTypeMainHelperMap {
  peerConnected: PeerMain;
  peerClosed: PeerMain;
  peerDatachannel: PeerMain;
}

type Partials<T> = {
  [P in keyof T]: T[P];
};

export type EmitTypeMain = Partials<EmitTypeMainMap>;

export type EmitTypeBus = Partials<EmitTypeBusMap>;

export type EmitTypeBusHelper = Partials<EmitTypeBusHelperMap>;

export type EmitTypeMainHelper = Partials<EmitTypeMainHelperMap>;
