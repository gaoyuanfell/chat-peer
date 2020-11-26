import { Component } from "@angular/core";
import { Peer } from "src/sdk/peer";
import { PeerHelper } from "src/sdk/peer.helper";

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

  peer: Peer;

  peerList: Array<[string, Peer]> = [];

  async login() {
    PeerHelper.instance.create(this.address);
    setInterval(() => {
      this.peerList = PeerHelper.instance.getPeerList();
    }, 2000);
  }

  showPeer(peer) {
    console.info(peer);
  }

  send() {
    // PeerHelper.instance.send(this.otherAddress, this.message);
  }

  connet() {
    PeerHelper.instance.launch(this.otherAddress);
    // PeerHelper.getPeer(this.otherAddress).launchPeer(this.otherAddress);
  }

  close() {
    PeerHelper.instance.getPeer(this.otherAddress).close();
  }

  scanAddressList() {
    PeerHelper.instance.scanAddressList();
  }

  call() {
    PeerHelper.instance.call(this.otherAddress);
  }
}
