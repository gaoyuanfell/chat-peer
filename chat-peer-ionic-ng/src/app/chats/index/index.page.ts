import { ChangeDetectorRef, Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { ModalController, NavController, ViewDidEnter, ViewWillEnter } from "@ionic/angular";
import { packForwardBlocks, unpackForwardBlocks, ChatResponseMessage } from "chat-peer-models";
import { Subject } from "rxjs";
import { BusMessageType } from "src/common/enum";
import { BusPeerHelper, MainPeerHelper, PeerMain } from "chat-peer-sdk";
import { VideoComponent } from "../video/video.component";

@Component({
  selector: "app-index",
  templateUrl: "./index.page.html",
  styleUrls: ["./index.page.scss"],
})
export class IndexPage implements OnInit, ViewWillEnter, ViewDidEnter {
  constructor(
    private router: Router,
    private cdrf: ChangeDetectorRef,
    private nav: NavController,
    private modal: ModalController
  ) {}

  ionViewDidEnter() {}

  ionViewWillEnter() {
    this.getPeerList();
  }

  peerList$ = new Subject<[string, PeerMain][]>();

  getPeerList() {
    this.peerList$.next(MainPeerHelper.instance.getPeerList());
  }

  goNetwork() {
    this.router.navigate(["/chats/network"]);
  }

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
        console.info(otherAddress, type, payload, BusMessageType[type]);
        switch (type) {
          case BusMessageType.CHAT_REQUEST:
            // 可以添加请求确认逻辑
            this.chatRequest(otherAddress, payload);
            break;
          case BusMessageType.CHAT_RESPONSE:
            this.chatResponse(otherAddress, payload);
            break;
          case BusMessageType.VIDEO_REQUEST:
            // 可以添加请求确认逻辑
            this.chatVideoRequest(otherAddress, payload);
            break;
          case BusMessageType.VIDEO_RESPONSE:
            this.chatVideResponse(otherAddress, payload);
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

    let arr = packForwardBlocks([
      {
        type: BusMessageType.CHAT_RESPONSE,
        payload: new Uint8Array(ChatResponseMessage.encode(model).finish()).buffer,
      },
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

  chat(peer: PeerMain) {
    let arr = packForwardBlocks([{ type: BusMessageType.CHAT_REQUEST, payload: new Uint8Array().buffer }]);
    BusPeerHelper.instance.send(peer.to, arr.buffer);
  }

  // 视频处理
  chatVideoRequest(otherAddress: string, payload: ArrayBuffer) {
    let businessId = Date.now().toString();

    let model = new ChatResponseMessage({
      businessId: businessId,
      agree: true,
    });

    const start = async () => {
      let mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      let videoCom = await this.modal.create({
        component: VideoComponent,
        componentProps: {
          stream: mediaStream,
          otherAddress,
          businessId,
        },
      });
      await videoCom.present();

      let arr = packForwardBlocks([
        {
          type: BusMessageType.VIDEO_RESPONSE,
          payload: new Uint8Array(ChatResponseMessage.encode(model).finish()).buffer,
        },
      ]);
      BusPeerHelper.instance.send(otherAddress, arr);
    };
    start();
  }

  chatVideResponse(otherAddress: string, payload: ArrayBuffer) {
    let msg = ChatResponseMessage.decode(new Uint8Array(payload));
    const start = async () => {
      let mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      let videoCom = await this.modal.create({
        component: VideoComponent,
        componentProps: {
          stream: mediaStream,
          otherAddress,
          businessId: msg.businessId,
        },
      });
      await videoCom.present();
      console.info("BusPeerHelper.instance.offer(otherAddress, msg.businessId);");
      BusPeerHelper.instance.offer(otherAddress, msg.businessId);
    };
    start();
  }

  chatVideo(peer: PeerMain) {
    let arr = packForwardBlocks([{ type: BusMessageType.VIDEO_REQUEST, payload: new Uint8Array().buffer }]);
    BusPeerHelper.instance.send(peer.to, arr.buffer);
  }

  scanAddressList() {
    MainPeerHelper.instance.scanAddressList();
  }
}
