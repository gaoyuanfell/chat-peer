import { Injectable } from "@angular/core";
import { DHT, PeerHelper, RPC } from "chat-peer-sdk";

@Injectable({
  providedIn: "root",
})
export class PeerService {
  constructor() {
    this.peerHelper = new PeerHelper();
  }

  peerHelper: PeerHelper;

  create(address: string) {
    this.peerHelper.create(address);
  }

  scanAddressList() {
    this.peerHelper.scanAddressList();
  }

  get rpc(): RPC {
    return this.peerHelper.rpc;
  }

  get dht(): DHT {
    return this.peerHelper.dht;
  }
}
