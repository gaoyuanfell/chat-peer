import { ChangeDetectorRef, Component, OnInit } from "@angular/core";
import { ViewDidLeave } from "@ionic/angular";
import { Subject } from "rxjs";
import { MainPeerHelper } from "src/sdk";

@Component({
  selector: "app-network",
  templateUrl: "./network.page.html",
  styleUrls: ["./network.page.scss"],
})
export class NetworkPage implements OnInit, ViewDidLeave {
  constructor(private cdrf: ChangeDetectorRef) {}

  addressList$ = new Subject<Array<string>>();

  listeners = [];

  ngOnInit() {
    MainPeerHelper.instance.getServerPeerList().then((data) => {
      this.addressList$.next(data);
    });

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

  status(address: string) {
    let boo = MainPeerHelper.instance.has(address);
    if (!boo) return false;
    return MainPeerHelper.instance.getPeer(address).connected;
  }

  ionViewDidLeave() {
    this.listeners.forEach((fn) => fn());
  }
}
