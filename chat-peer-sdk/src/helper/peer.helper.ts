import { Contact, Id } from "../kademlia";
import { BusPeerHelper } from "./bus-peer.helper";
import { MainPeerHelper } from "./main-peer.helper";

export class PeerHelper {
  address!: string;

  create(address: string) {
    this.address = address;
    BusPeerHelper.instance.createPool(address);
    MainPeerHelper.instance.registerMainBusiness(
      BusPeerHelper.instance.onMainBusiness.bind(BusPeerHelper.instance)
    );
    MainPeerHelper.instance.registerMainBusinessBefore(
      BusPeerHelper.instance.onMainBusinessBefore.bind(BusPeerHelper.instance)
    );

    return MainPeerHelper.instance.waitingConnection(address);
  }

  scanAddressList() {
    MainPeerHelper.instance.scanAddressList();
  }

  get rpc() {
    return MainPeerHelper.instance.rpc;
  }

  get dht() {
    return MainPeerHelper.instance.dht;
  }

  async find(targetAddress: string) {
    let peer = MainPeerHelper.instance.pool.get(targetAddress);
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
