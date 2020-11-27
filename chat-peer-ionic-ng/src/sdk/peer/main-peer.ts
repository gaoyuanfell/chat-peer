import { Peer } from "./peer";

export class PeerMain<T> extends Peer<T> {
  constructor(address: string) {
    super(address);
  }

  peerEvent() {
    throw new Error("Method not implemented.");
  }
  launchPeer(address: string) {
    throw new Error("Method not implemented.");
  }
  offerHandler(description: RTCSessionDescriptionInit, from: string) {
    throw new Error("Method not implemented.");
  }
  sendOffer() {
    throw new Error("Method not implemented.");
  }
  sendAnswer() {
    throw new Error("Method not implemented.");
  }
  sendCandidate(candidate: RTCIceCandidate) {
    throw new Error("Method not implemented.");
  }
  close() {
    throw new Error("Method not implemented.");
  }
}
