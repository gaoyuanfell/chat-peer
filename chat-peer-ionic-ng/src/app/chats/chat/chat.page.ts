import { ChangeDetectorRef, Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { ModalController, NavController, ViewDidEnter, ViewDidLeave, ViewWillEnter } from "@ionic/angular";
import { Subject } from "rxjs";
import { BusPeerHelper, PeerBus } from "chat-peer-sdk";
import { packForwardBlocks } from "chat-peer-models";
import { BusMessageType } from "src/common/enum";
import { ChatService } from "src/services/chat.service";

@Component({
  selector: "app-chat",
  templateUrl: "./chat.page.html",
  styleUrls: ["./chat.page.scss"],
})
export class ChatPage implements OnInit, ViewDidLeave, ViewDidEnter, ViewWillEnter {
  // peer: PeerBus;

  listeners = [];

  messageList = [];
  // messageList$ = new Subject();

  messages: string;

  constructor(
    private route: ActivatedRoute,
    private navCtrl: NavController,
    private cdrf: ChangeDetectorRef,
    private chat: ChatService
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
    return BusPeerHelper.instance.getBusPeer(this.otherAddress, this.businessId);
  }

  initChat() {
    // let { businessId } = this.route.snapshot.queryParams;
    // this.peer = BusPeerHelper.instance.getBusPeer(otherAddress, businessId);
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
        this.chatRecovery();
      }),
      this.peer.on("connected", () => {
        console.info("连接成功");
      })
    );
  }

  ngOnInit() {}

  chatVideo() {
    let arr = packForwardBlocks([{ type: BusMessageType.VIDEO_REQUEST, payload: new Uint8Array().buffer }]);
    BusPeerHelper.instance.send(this.peer.to, arr.buffer);
  }

  // 挂断
  hangup() {}

  chatRecovery() {
    if (this.peer.connected) {
      this.listeners.forEach((fn) => fn());
      this.initChat();
    }
  }

  destroy() {
    this.listeners.forEach((fn) => fn());
    this.peer.close();
  }

  ionViewDidLeave() {
    this.destroy();
  }
}
