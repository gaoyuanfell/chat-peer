import { ChangeDetectorRef, Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { NavController, ViewDidEnter, ViewDidLeave, ViewWillEnter } from "@ionic/angular";
import { PeerBus } from "chat-peer-sdk";
import { packForwardBlocks } from "chat-peer-models";
import { BusMessageType } from "src/common/enum";
import { ChatService } from "src/services/chat.service";
import { PeerService } from "src/services/peer.service";

@Component({
  selector: "app-chat",
  templateUrl: "./chat.page.html",
  styleUrls: ["./chat.page.scss"],
})
export class ChatPage implements OnInit, ViewDidLeave, ViewDidEnter, ViewWillEnter {
  listeners = [];

  messageList = [];

  messages: string;

  constructor(
    private route: ActivatedRoute,
    private navCtrl: NavController,
    private cdrf: ChangeDetectorRef,
    private chat: ChatService,
    private peerService: PeerService
  ) {
    let { businessId, otherAddress } = this.route.snapshot.queryParams;
    this.businessId = businessId;
    this.otherAddress = otherAddress;
    this.initChat();
  }

  ionViewWillEnter() {}

  ionViewDidEnter() {}

  send() {
    console.info(this.messages);
    if (!this.messages) return;
    this.peer.channelSend(this.messages);
    this.messageList.push({
      self: true,
      content: this.messages,
    });
    this.messages = "";
    this.cdrf.detectChanges();
  }

  businessId: string;
  otherAddress: string;

  get peer(): PeerBus {
    return this.peerService.busPeerHelper.getBusPeer(this.otherAddress, this.businessId);
  }

  initChat() {
    // let { businessId } = this.route.snapshot.queryParams;
    // this.peer = busPeerHelper.getBusPeer(otherAddress, businessId);
    // let chatModel = await this.chat.getChat(this.businessId);
    // if (!chatModel) throw new Error("会话不存在");
    if (!this.peer.connected) {
      this.chat.lunchChat(this.otherAddress, this.businessId);
    }
    this.listeners.push(
      this.peer.on("message", (e) => {
        console.info(e.data);
        this.messageList.push({
          self: false,
          content: e.data as any,
        });
        // this.messageList$.next([...this.messageList]);
        this.cdrf.detectChanges();
      }),
      this.peer.on("closed", () => {
        console.info("closed");
        console.info(this.peer);
      }),
      this.peer.on("connected", () => {
        console.info("连接成功");
      })
    );
  }

  ngOnInit() {}

  chatVideo() {
    let arr = packForwardBlocks([{ type: BusMessageType.VIDEO_REQUEST, payload: new Uint8Array().buffer }]);
    this.peerService.busPeerHelper.send(this.peer.to, arr.buffer);
  }

  // 挂断
  hangup() {}

  chatRecovery() {}

  destroy() {
    this.peer.destroy();
  }

  ionViewDidLeave() {
    this.destroy();
  }
}
