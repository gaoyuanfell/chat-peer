import { ChangeDetectorRef, Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { ViewDidEnter, ViewWillEnter } from "@ionic/angular";
import { packForwardBlocks, unpackForwardBlocks, ChatResponseMessage } from "chat-peer-models";
import { Subject } from "rxjs";
import { BusMessageType } from "src/common/enum";
import { BusPeerHelper, MainPeerHelper, PeerMain } from "src/sdk";

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

    BusPeerHelper.instance.on("mainMessage", ({ otherAddress, buffer }) => {
      unpackForwardBlocks(buffer, ({ type, payload }) => {
        console.info(otherAddress, type, payload);
        switch (type) {
          case BusMessageType.CHAT_REQUEST:
            this.chatRequest(otherAddress, payload);
            break;
          case BusMessageType.CHAT_RESPONSE:
            this.chatResponse(otherAddress, payload);
            break;
        }
      });
    });
  }

  async chatRequest(otherAddress: string, payload: ArrayBuffer) {
    let businessId = Date.now().toString();
    let model = new ChatResponseMessage({
      businessId: businessId,
      agree: true,
    });
    await this.router.navigate(["/chats/chat"], {
      queryParams: { otherAddress: otherAddress, businessId: businessId },
    });

    let uinArr = ChatResponseMessage.encode(model).finish();
    let uin = new Uint8Array(uinArr.length);
    uin.set(uinArr);

    let arr = packForwardBlocks([
      { type: BusMessageType.CHAT_RESPONSE, payload: uin.buffer }, // ChatResponseMessage.encode(model).finish().buffer
    ]);
    BusPeerHelper.instance.send(otherAddress, arr);
  }

  async chatResponse(otherAddress: string, payload: ArrayBuffer) {
    let msg = ChatResponseMessage.decode(new Uint8Array(payload));
    console.info(msg.toJSON());
    await this.router.navigate(["/chats/chat"], {
      queryParams: { otherAddress: otherAddress, businessId: msg.businessId },
    });
    BusPeerHelper.instance.offer(otherAddress, msg.businessId);
  }

  getPeerList() {
    this.peerList$.next(MainPeerHelper.instance.getPeerList());
  }

  goNetwork() {
    this.router.navigate(["/chats/network"]);
  }

  chat(peer: PeerMain) {
    let arr = packForwardBlocks([{ type: BusMessageType.CHAT_REQUEST, payload: new Uint8Array().buffer }]);
    BusPeerHelper.instance.send(peer.to, arr.buffer);
  }
}
