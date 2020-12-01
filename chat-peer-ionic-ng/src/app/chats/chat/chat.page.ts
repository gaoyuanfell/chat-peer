import { ChangeDetectorRef, Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { ModalController, NavController, ViewDidEnter, ViewDidLeave, ViewWillEnter } from "@ionic/angular";
import { Subject } from "rxjs";
import { BusPeerHelper, PeerBus } from "chat-peer-sdk";

@Component({
  selector: "app-chat",
  templateUrl: "./chat.page.html",
  styleUrls: ["./chat.page.scss"],
})
export class ChatPage implements OnInit, ViewDidLeave, ViewDidEnter, ViewWillEnter {
  peer: PeerBus;

  listeners = [];

  messageList = [
    {
      self: true,
      content: "123123",
    },
    {
      self: false,
      content: "123123123123",
    },
    {
      self: true,
      content: "123123",
    },
    {
      self: false,
      content: "123123123123",
    },
    {
      self: true,
      content: "123123",
    },
    {
      self: false,
      content: "123123123123",
    },
    {
      self: true,
      content: "123123",
    },
    {
      self: false,
      content: "123123123123",
    },
    {
      self: true,
      content: "123123",
    },
    {
      self: false,
      content: "123123123123",
    },
    {
      self: true,
      content: "123123",
    },
    {
      self: false,
      content: "123123123123",
    },
    {
      self: true,
      content: "123123",
    },
    {
      self: false,
      content: "123123123123",
    },
    {
      self: true,
      content: "123123",
    },
    {
      self: false,
      content: "123123123123",
    },
  ];
  // messageList$ = new Subject();

  messages: string;

  constructor(private route: ActivatedRoute, private navCtrl: NavController, private cdrf: ChangeDetectorRef) {}

  ionViewWillEnter() {
    // this.messageList$.next([...this.messageList]);
    // this.cdrf.markForCheck();
  }

  ionViewDidEnter() {}

  send() {
    console.info(this.messages);
    if (!this.messages) return;
    this.peer.channelSend(this.messages);
    this.messageList.push({
      self: true,
      content: this.messages,
    });
    // this.messageList$.next([...this.messageList]);
    this.messages = "";
    this.cdrf.detectChanges();
  }

  ngOnInit() {
    let { otherAddress, businessId } = this.route.snapshot.queryParams;
    this.peer = BusPeerHelper.instance.getBusPeer(otherAddress, businessId);
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
      }),
      this.peer.on("connected", () => {
        console.info("连接成功");
      })
    );
  }

  ionViewDidLeave() {
    this.listeners.forEach((fn) => fn());
    this.peer.close();
  }
}
