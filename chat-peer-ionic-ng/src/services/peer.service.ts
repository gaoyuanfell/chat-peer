import { Injectable } from "@angular/core";
import { Peer } from "./peer";
import { SocketService } from "./socket.service";
import { UserService } from "./user.service";

/**
 * demo
 */

@Injectable({
  providedIn: "root",
})
export class PeerService {
  constructor(private socket: SocketService, private user: UserService) {}

  async connect(address: string) {
    let peer = this.get(address);
    await this.socket.connent();
    console.info(address);
    peer.registerServer(this.socket);

    let [onMessage, onTrack] = peer.eventRef();
    onMessage((d) => {
      console.info(d);
    });
    onTrack((d) => {
      console.info(d);
    });
    peer.launchPeer(address);
  }

  pool = new Map<string, Peer>();

  /**
   *
   * @param address 对方地址
   */
  get(address: string) {
    let _pool = this.pool.get(address);
    if (!_pool) {
      _pool = new Peer(this.user.getCurrentAddress());
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
