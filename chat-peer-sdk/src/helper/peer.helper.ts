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

  destroy() {}
}
