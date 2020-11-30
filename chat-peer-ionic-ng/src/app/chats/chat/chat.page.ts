import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { NavController, ViewDidEnter, ViewDidLeave, ViewWillEnter } from "@ionic/angular";
import { BusPeerHelper, PeerBus, Subscribe } from "src/sdk";

@Component({
  selector: "app-chat",
  templateUrl: "./chat.page.html",
  styleUrls: ["./chat.page.scss"],
})
export class ChatPage implements OnInit, ViewDidLeave {
  peer: PeerBus;

  listeners = [];

  messageList = [
    {
      self: true,
      content: "123123123123123123123123123123123123123123123123123123123123123123123123123123123",
    },
    {
      self: false,
      content: "1231231qweqweqwe",
    },
    {
      self: false,
      content: "1231231qweqweqwe",
    },
    {
      self: true,
      content: "1231231qweqweqwe",
    },
  ];

  message: string;

  constructor(private route: ActivatedRoute, private navCtrl: NavController) {
    // let { otherAddress, businessId } = route.snapshot.queryParams;
    // this.peer = BusPeerHelper.instance.getBusPeer(otherAddress, businessId);
    // this.listeners.push(
    //   this.peer.on("message", (e) => {
    //     console.info(e);
    //     this.messageList$.next(e.data)
    //   }),
    //   this.peer.on("connected", () => {
    //     console.info("连接成功");
    //   })
    // );
    // console.info(this.peer);
  }

  queryParams() {
    return this.route.snapshot.queryParams;
  }

  ngOnInit() {}

  ionViewDidLeave() {
    this.listeners.forEach((fn) => fn());
    this.peer.close();
  }
}
