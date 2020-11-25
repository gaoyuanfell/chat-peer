import { UserService } from "src/services/user.service";
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

  constructor(private user: UserService) {}

  wss: WebSocket;

  peer: Peer;

  async login() {
    PeerHelper.instance.create(this.address);

    // PeerHelper.createPeer(this.address);

    // this.user.setCurrentAddress(this.address);

    setInterval(() => {
      console.info(PeerHelper.instance.getPeerList());
    }, 2000);
  }

  send() {
    PeerHelper.instance.getPeer(this.otherAddress).channelSend(this.message);
  }

  connet() {
    PeerHelper.instance.launch(this.otherAddress);
    // PeerHelper.getPeer(this.otherAddress).launchPeer(this.otherAddress);
  }

  close() {
    PeerHelper.instance.getPeer(this.otherAddress).close();
  }
}
