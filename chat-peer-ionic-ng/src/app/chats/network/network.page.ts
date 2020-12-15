import { ChangeDetectorRef, Component, OnInit } from "@angular/core";
import { ViewDidEnter, ViewDidLeave } from "@ionic/angular";
import { Subject } from "rxjs";
import { MainPeerHelper } from "chat-peer-sdk";
import { ChatService } from "src/services/chat.service";

@Component({
  selector: "app-network",
  templateUrl: "./network.page.html",
  styleUrls: ["./network.page.scss"],
})
export class NetworkPage implements OnInit, ViewDidLeave, ViewDidEnter {
  constructor(private cdrf: ChangeDetectorRef, private chat: ChatService) {}

  message: string;

  ionViewDidEnter() {}

  addressList$ = new Subject<Array<string>>();

  listeners = [];

  ngOnInit() {
    try {
      MainPeerHelper.instance.getServerPeerList().then((data) => {
        this.addressList$.next(data);
      });
    } catch (error) {
      alert(error);
    }

    this.listeners.push(
      MainPeerHelper.instance.on("peerConnected", (peer) => {
        this.cdrf.detectChanges();
      }),
      MainPeerHelper.instance.on("peerClosed", (peer) => {
        this.cdrf.detectChanges();
      })
    );
  }

  connect(otherAddress: string) {
    let peer = MainPeerHelper.instance.launch(otherAddress);
    console.info(peer);
  }

  resconnect(otherAddress: string) {
    let peer = MainPeerHelper.instance.reslaunch(otherAddress);
    console.info(peer);
  }

  status(address: string) {
    let boo = MainPeerHelper.instance.has(address);
    if (!boo) return false;
    return MainPeerHelper.instance.getPeer(address).connected;
  }

  hasKey(address: string) {
    return MainPeerHelper.instance.has(address);
  }

  lunchChat(address: string) {
    this.chat.lunchChat(address);
  }

  scanAddressList() {
    MainPeerHelper.instance.scanAddressList();
  }

  ionViewDidLeave() {
    this.listeners.forEach((fn) => fn());
  }
}
