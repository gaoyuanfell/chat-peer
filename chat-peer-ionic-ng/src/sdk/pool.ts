import { PeerServer } from "chat-peer-models";
import { Peer } from "./peer";

export class Pool {
  address: string; // 自己的地址
  constructor(address: string) {
    this.address = address;
  }

  private pool = new Map<string, Peer>();

  /**
   *
   * @param address 对方地址
   */
  get(address: string) {
    let _pool = this.pool.get(address);
    if (!_pool) {
      _pool = new Peer(this.address);
      this.pool.set(address, _pool);
    }
    return _pool;
  }

  /**
   *
   * @param address 对方地址
   */
  remove(address: string) {
    let _pool = this.pool.get(address);
    if (_pool) {
      _pool.destroy();
    }
  }

  reset() {
    for (const pool of this.pool.values()) {
      pool.destroy();
    }
  }
}
