import { Component, OnInit } from "@angular/core";
import { BusPeerHelper } from "src/sdk";

@Component({
  selector: "app-chat",
  templateUrl: "./chat.page.html",
  styleUrls: ["./chat.page.scss"],
})
export class ChatPage implements OnInit {
  constructor() {}

  ngOnInit() {
    BusPeerHelper.instance.on("mainMessage", ({ otherAddress, buffer }) => {});
  }

  send() {
    BusPeerHelper.instance.send();
  }
}
