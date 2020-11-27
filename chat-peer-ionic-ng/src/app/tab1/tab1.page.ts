import { BusPeerHelper } from "./../../sdk/bus-peer.helper";
import { Component } from "@angular/core";
import { PeerHelper } from "src/sdk/peer.helper";
import { PeerMain } from "src/sdk/peer/main-peer";

@Component({
  selector: "app-tab1",
  templateUrl: "tab1.page.html",
  styleUrls: ["tab1.page.scss"],
})
export class Tab1Page {
  address: string;
  otherAddress: string;
  message: string;

  constructor() {}

  wss: WebSocket;

  mainPeer;
  peer;

  peerList: Array<[string, PeerMain]> = [];

  other;
  my;

  async login() {
    PeerHelper.instance.create(this.address);
    setInterval(() => {
      this.peerList = PeerHelper.instance.getPeerList();
    }, 2000);
  }

  connet() {
    this.mainPeer = PeerHelper.instance.launch(this.otherAddress);
  }

  scanAddressList() {
    PeerHelper.instance.scanAddressList();
  }

  async call() {
    let { stream, peer } = await BusPeerHelper.instance.call(this.otherAddress);
    this.my = stream;
    console.info(peer);
    this.peer = peer;
    // this.my = await PeerHelper.instance.call(this.otherAddress);
  }

  send() {
    this.peer.channelSend(this.message);
    // PeerHelper.instance.send(this.otherAddress, this.message);
  }

  close() {
    this.peer.close();
    // PeerHelper.instance.getPeer(this.otherAddress).close();
  }

  showPeer(peer) {
    console.info(peer);
  }
}
