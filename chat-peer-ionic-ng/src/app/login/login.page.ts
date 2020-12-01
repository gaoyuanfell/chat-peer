import { Component, OnInit } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { Router } from "@angular/router";
import { NavController } from "@ionic/angular";
import { ChatResponseMessage } from "chat-peer-models";
import { PeerHelper } from "chat-peer-sdk";
import { UserService } from "src/services/user.service";

@Component({
  selector: "app-login",
  templateUrl: "./login.page.html",
  styleUrls: ["./login.page.scss"],
})
export class LoginPage implements OnInit {
  constructor(private router: Router, private user: UserService, private title: Title, private nav: NavController) {
    this.peerHelper = new PeerHelper();
  }

  peerHelper: PeerHelper;

  ngOnInit() {}

  address: string;

  login() {
    let t = this.title.getTitle();
    this.title.setTitle(`${t} | ${this.address}`);
    this.user.setCurrentAddress(this.address);
    this.peerHelper.create(this.address);
    this.router.navigate(["/chats"]);
    // this.nav.navigateForward(["/chats"]);

    let a = new ChatResponseMessage({
      businessId: "1",
    });

    let arr = ChatResponseMessage.encode(a).finish();

    console.info(arr);
    console.info(arr.buffer);
    console.info(arr.length);
    console.info(arr.byteLength);
  }
}
