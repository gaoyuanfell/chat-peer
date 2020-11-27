import { Peer } from "./peer";
import { EmitTypeBus } from "./subscribe";

export class BusPool {
  address: string; // 自己的地址
  constructor(address: string) {
    this.address = address;
  }

  #pool = new Map<string, Map<string, Peer<EmitTypeBus>>>();

  get(otherAddress: string, businessId: string) {
    let peers = this.#pool.get(otherAddress);
    if (!peers) peers = new Map();
    if (peers.has(businessId)) return peers.get(businessId);
    let peer = new Peer(this.address, true);
    peer.businessId = businessId;
    peers.set(businessId, peer);
    this.#pool.set(otherAddress, peers);
    return peer;
  }

  remove(otherAddress: string, businessId: string) {
    if (this.#pool.has(otherAddress)) {
      let _pool = this.#pool.get(otherAddress);
      if (_pool.has(businessId)) {
        let peer = _pool.get(businessId);
        _pool.delete(businessId);
        if (peer && peer.connected) {
          peer.close();
        }
      }
    }
  }
}
