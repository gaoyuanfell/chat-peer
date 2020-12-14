import { ChangeDetectorRef, Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { ViewDidEnter, ViewWillEnter } from "@ionic/angular";
import { ChatService } from "src/services/chat.service";
import { ChatDBModel } from "src/common/db.helper";
import { chatListUpdate$ } from "src/common/subscribes";

@Component({
  selector: "app-index",
  templateUrl: "./index.page.html",
  styleUrls: ["./index.page.scss"],
})
export class IndexPage implements OnInit, ViewWillEnter, ViewDidEnter {
  constructor(private router: Router, private cdrf: ChangeDetectorRef, private chat: ChatService) {}

  ionViewDidEnter() {}

  ionViewWillEnter() {}

  chatList: ChatDBModel[] = [];

  goNetwork() {
    this.router.navigate(["/chats/network"]);
  }

  goContact() {
    this.router.navigate(["/contact"]);
  }

  async getChatList() {
    this.chatList = await this.chat.getChatList();
    this.cdrf.detectChanges();
  }

  goChat(chat: ChatDBModel) {
    this.router.navigate(["/chats/chat"], {
      queryParams: { businessId: chat.businessId, otherAddress: chat.member[0] },
    });
  }

  ngOnInit() {
    this.getChatList();
    chatListUpdate$.subscribe(() => {
      this.getChatList();
    });
  }
}
