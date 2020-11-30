import { BusPeerHelper } from "./bus-peer.helper";
import { MainPeerHelper } from "./main-peer.helper";

export class PeerHelper {
  address: string;

  create(address: string) {
    this.address = address;
    BusPeerHelper.instance.createPool(address);
    return MainPeerHelper.instance.waitingConnection(address);
  }

  destroy() {}
}
