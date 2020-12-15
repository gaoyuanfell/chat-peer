import { Component } from "@angular/core";
import { SplashScreen } from "@ionic-native/splash-screen/ngx";
import { StatusBar } from "@ionic-native/status-bar/ngx";

import { Platform } from "@ionic/angular";
import { unpackForwardBlocks } from "chat-peer-models";
import { mainPeer$ } from "src/common/subscribes";
import { ChatService } from "src/services/chat.service";
import { PeerService } from "src/services/peer.service";

@Component({
  selector: "app-root",
  templateUrl: "app.component.html",
  styleUrls: ["app.component.scss"],
})
export class AppComponent {
  constructor(
    private chat: ChatService,
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private peer: PeerService
  ) {
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();
    });

    this.chat.init();

    this.mainEvent();
  }

  mainEvent() {
    this.peer.busPeerHelper.on("mainMessage", ({ otherAddress, buffer }) => {
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
