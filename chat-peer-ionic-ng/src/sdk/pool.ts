import { PeerMain } from "./peer/main-peer";

export class Pool {
  address: string; // 自己的地址
  constructor(address: string) {
    this.address = address;
  }

  #pool = new Map<string, PeerMain>();

  has(address: string) {
    return this.#pool.has(address);
  }

  /**
   *
   * @param address 对方地址
   */
  get(address: string) {
    let _pool = this.#pool.get(address);
    if (!_pool) {
      _pool = new PeerMain(this.address);
      this.#pool.set(address, _pool);
    }
    return _pool;
  }

  getAll() {
    return [...this.#pool.entries()];
  }

  /**
   * @param address 对方地址
   */
  remove(address: string) {
    if (this.#pool.has(address)) {
      let _pool = this.#pool.get(address);
      this.#pool.delete(address);
      if (_pool && _pool.connected) {
        _pool.close();
      }
    }
  }

  reset() {
    for (const pool of this.#pool.values()) {
      pool.close();
    }
    this.#pool.clear();
  }
}
