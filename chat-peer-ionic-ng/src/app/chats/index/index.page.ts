import { ChangeDetectorRef, Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { ViewDidEnter, ViewWillEnter } from "@ionic/angular";
import { Subject } from "rxjs";
import { MainPeerHelper, PeerMain } from "src/sdk";

@Component({
  selector: "app-index",
  templateUrl: "./index.page.html",
  styleUrls: ["./index.page.scss"],
})
export class IndexPage implements OnInit, ViewWillEnter, ViewDidEnter {
  constructor(private router: Router, private cdrf: ChangeDetectorRef) {}

  ionViewDidEnter() {}

  ionViewWillEnter() {
    this.getPeerList();
  }

  peerList$ = new Subject<[string, PeerMain][]>();

  ngOnInit() {
    MainPeerHelper.instance.on("peerConnected", () => {
      this.getPeerList();
      this.cdrf.detectChanges();
    });

    MainPeerHelper.instance.on("peerClosed", () => {
      this.getPeerList();
      this.cdrf.detectChanges();
    });
  }

  getPeerList() {
    this.peerList$.next(MainPeerHelper.instance.getPeerList());
  }

  goNetwork() {
    this.router.navigate(["/chats/network"]);
  }

  chat(peer: PeerMain) {
    console.info(peer);
    this.router.navigate(["/chats/chat"], { queryParams: { businessId: Date.now().toString() } });
  }
}
