import { Contact, Id } from "../kademlia";
import { busPeerHelper } from "./bus-peer.helper";
import { mainPeerHelper } from "./main-peer.helper";

export class PeerHelper {
  address!: string;

  create(address: string) {
    this.address = address;
    busPeerHelper.createPool(address);
    mainPeerHelper.registerMainBusiness(
      busPeerHelper.onMainBusiness.bind(busPeerHelper)
    );
    mainPeerHelper.registerMainBusinessBefore(
      busPeerHelper.onMainBusinessBefore.bind(busPeerHelper)
    );
    return mainPeerHelper.waitingConnection(address);
  }

  scanAddressList() {
    mainPeerHelper.scanAddressList();
  }

  get rpc() {
    return mainPeerHelper.rpc;
  }

  get dht() {
    return mainPeerHelper.dht;
  }

  async find(targetAddress: string) {
    let peer = mainPeerHelper.pool.get(targetAddress);
    if (peer.connected) {
      return {
        bridge: null,
        contacts: [new Contact(Id.fromKey(peer.to))],
      };
    }
    return this.dht.find(targetAddress);
  }

  destroy() {}
}
