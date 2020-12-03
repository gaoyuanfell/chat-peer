import { Component } from "@angular/core";

import { Platform } from "@ionic/angular";
import { unpackForwardBlocks } from "chat-peer-models";
import { BusPeerHelper } from "chat-peer-sdk";
import { mainPeer$ } from "src/common/subscribes";
import { ChatService } from "src/services/chat.service";

@Component({
  selector: "app-root",
  templateUrl: "app.component.html",
  styleUrls: ["app.component.scss"],
})
export class AppComponent {
  constructor(
    private chat: ChatService,
    private platform: Platform // private splashScreen: SplashScreen, // private statusBar: StatusBar
  ) {
    this.initializeApp();
  }

  initializeApp() {
    // this.platform.ready().then(() => {
    //   this.statusBar.styleDefault();
    //   this.splashScreen.hide();
    // });

    this.chat.init();

    this.mainEvent();
  }

  mainEvent() {
    BusPeerHelper.instance.on("mainMessage", ({ otherAddress, buffer }) => {
      console.info(otherAddress);
      unpackForwardBlocks(buffer, ({ type, payload }) => {
        mainPeer$.next({
          type,
          payload,
          otherAddress,
        });
      });
    });
  }
}
