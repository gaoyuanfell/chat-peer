import { PeerBus } from "../peer";

export class BusPool {
  address: string; // 自己的地址
  constructor(address: string) {
    this.address = address;
  }

  private pool = new Map<string, Map<string, PeerBus>>();

  has(address: string, businessId: string) {
    let bo = this.pool.has(address);
    if (!bo) return false;
    let pool = this.pool.get(address);
    if (!pool) return false;
    return pool.has(businessId);
  }

  get(otherAddress: string, businessId: string) {
    let peers = this.pool.get(otherAddress);
    if (!peers) peers = new Map();
    if (peers.has(businessId)) {
      let p = peers.get(businessId);
      if (p) return p;
    }
    let peer = new PeerBus(this.address);
    peer.businessId = businessId;
    peers.set(businessId, peer);
    this.pool.set(otherAddress, peers);
    return peer;
  }

  remove(otherAddress: string, businessId: string) {
    if (this.pool.has(otherAddress)) {
      let _pool = this.pool.get(otherAddress);
      if (_pool && _pool.has(businessId)) {
        _pool.delete(businessId);
      }
    }
  }

  reset() {
    for (const pool of this.pool.values()) {
      for (const peer of pool.values()) {
        peer.close();
      }
      pool.clear();
    }
    this.pool.clear();
  }
}
