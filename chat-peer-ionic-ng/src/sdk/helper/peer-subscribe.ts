import { Subscribe } from "../subscribe";

class PeerSubscribe extends Subscribe<any> {
  constructor() {
    super();
  }
}

export const peerSubscribe = new PeerSubscribe();
