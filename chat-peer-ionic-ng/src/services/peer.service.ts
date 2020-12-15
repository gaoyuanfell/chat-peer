import { Injectable } from "@angular/core";
import { DHT, PeerHelper, RPC, busPeerHelper, mainPeerHelper } from "chat-peer-sdk";

@Injectable({
  providedIn: "root",
})
export class PeerService {
  constructor() {
    this.peerHelper = new PeerHelper();
  }

  private _busPeerHelper = busPeerHelper;
  private _mainPeerHelper = mainPeerHelper;

  peerHelper: PeerHelper;

  create(address: string) {
    this.peerHelper.create(address);
  }

  scanAddressList() {
    this.peerHelper.scanAddressList();
  }

  find(targetAddress: string) {
    return this.peerHelper.find(targetAddress);
  }

  get mainPeerHelper() {
    return this._mainPeerHelper;
  }

  get busPeerHelper() {
    return this._busPeerHelper;
  }

  get rpc(): RPC {
    return this.peerHelper.rpc;
  }

  get dht(): DHT {
    return this.peerHelper.dht;
  }
}
