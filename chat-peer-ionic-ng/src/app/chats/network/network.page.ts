import { ChangeDetectorRef, Component, OnInit } from "@angular/core";
import { ViewDidEnter, ViewDidLeave } from "@ionic/angular";
import { Subject } from "rxjs";
import { ChatService } from "src/services/chat.service";
import { PeerService } from "src/services/peer.service";

@Component({
  selector: "app-network",
  templateUrl: "./network.page.html",
  styleUrls: ["./network.page.scss"],
})
export class NetworkPage implements OnInit, ViewDidLeave, ViewDidEnter {
  constructor(private cdrf: ChangeDetectorRef, private chat: ChatService, private peer: PeerService) {}

  message: string;

  ionViewDidEnter() {}

  addressList$ = new Subject<Array<string>>();

  listeners = [];

  ngOnInit() {
    try {
      this.peer.mainPeerHelper.getServerPeerList().then((data) => {
        this.addressList$.next(data);
      });
    } catch (error) {
      alert(error);
    }

    this.listeners.push(
      this.peer.mainPeerHelper.on("peerConnected", (peer) => {
        this.cdrf.detectChanges();
      }),
      this.peer.mainPeerHelper.on("peerClosed", (peer) => {
        this.cdrf.detectChanges();
      })
    );
  }

  connect(otherAddress: string) {
    let peer = this.peer.mainPeerHelper.launch(otherAddress);
    console.info(peer);
  }

  resconnect(otherAddress: string) {
    let peer = this.peer.mainPeerHelper.reslaunch(otherAddress);
    console.info(peer);
  }

  status(address: string) {
    let boo = this.peer.mainPeerHelper.has(address);
    if (!boo) return null;
    return this.peer.mainPeerHelper.getPeer(address).connected;
  }

  hasKey(address: string) {
    return this.peer.mainPeerHelper.has(address);
  }

  lunchChat(address: string) {
    this.chat.lunchChat(address);
  }

  scanAddressList() {
    this.peer.mainPeerHelper.scanAddressList();
  }

  ionViewDidLeave() {
    this.listeners.forEach((fn) => fn());
  }
}
