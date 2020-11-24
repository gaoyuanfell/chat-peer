// new closed connecting connected disconnected failed message

export type EmitType = RTCPeerConnectionState | "message" | "track" | "sendOffer" | "sendAnswer" | "sendCandidate";

export class Subscribe {
  emit(type: EmitType, data?: unknown) {
    let fnArr = this.#map.get(type);
    if (fnArr) {
      fnArr.forEach((fn) => {
        fn(data);
      });
    }
  }

  #map = new Map<string, Function[]>();

  on(type: EmitType, fn) {
    let fnArr = this.#map.get(type);
    if (!fnArr) fnArr = [];
    fnArr.push(fn);
    this.#map.set(type, fnArr);
  }

  once(type: EmitType, fn) {
    let fnArr = this.#map.get(type);
    if (!fnArr) fnArr = [];

    let _fn = (data) => {
      fn(data);
      let index = fnArr.indexOf(_fn);
      if (index !== -1) fnArr.splice(index, 1);
    };

    fnArr.push(_fn);
    this.#map.set(type, fnArr);
  }

  destroy() {
    this.#map.clear();
  }
}
