import { IDataBlockTransport } from "chat-peer-models";

export type EmitTypeMap = {
  connected: Event;
  connecting: Event;
  disconnected: Event;
  failed: Event;
  new: Event;

  icegatheringstatechange: RTCIceGatheringState;
  signalingstatechange: RTCSignalingState;
  iceconnectionstatechange: RTCIceConnectionState;
  connectionstatechange: RTCPeerConnectionState;
  icecandidateerror: RTCPeerConnectionIceErrorEvent;
  icecandidate: RTCPeerConnectionIceEvent;
  datachannel: RTCDataChannelEvent;
  message: MessageEvent<ArrayBuffer>;
  track: RTCTrackEvent;
  sendOffer: IDataBlockTransport;
  sendAnswer: IDataBlockTransport;
  sendCandidate: IDataBlockTransport;
  closed: any;
};

export class Subscribe {
  emit<T extends keyof EmitTypeMap>(type: T, data?: EmitTypeMap[T]) {
    let fnArr = this.#map.get(type);
    if (fnArr) {
      fnArr.forEach((fn) => {
        fn(data);
      });
    }
  }

  #map = new Map<string, Function[]>();

  on<T extends keyof EmitTypeMap>(type: T, listener: (this: Subscribe, ev: EmitTypeMap[T]) => any) {
    let fnArr = this.#map.get(type);
    if (!fnArr) fnArr = [];
    fnArr.push(listener.bind(this));
    this.#map.set(type, fnArr);
  }

  once<T extends keyof EmitTypeMap>(type: T, listener: (this: Subscribe, ev: EmitTypeMap[T]) => any) {
    let fnArr = this.#map.get(type);
    if (!fnArr) fnArr = [];

    let _fn = (data) => {
      listener.bind(this)(data);
      let index = fnArr.indexOf(_fn);
      if (index !== -1) fnArr.splice(index, 1);
    };

    fnArr.push(_fn);
    this.#map.set(type, fnArr);
  }

  clear() {
    this.#map.clear();
  }
}
