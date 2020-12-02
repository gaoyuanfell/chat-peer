import { Component } from "@angular/core";
import { AlertController } from "@ionic/angular";
import { MainPeerHelper, BusPeerHelper, PeerMain, PeerHelper } from "chat-peer-sdk";

@Component({
  selector: "app-tab1",
  templateUrl: "tab1.page.html",
  styleUrls: ["tab1.page.scss"],
})
export class Tab1Page {
  address: string;
  otherAddress: string;
  message: string;
  peerHelper: PeerHelper;

  constructor(public alertController: AlertController) {
    this.peerHelper = new PeerHelper();
  }

  wss: WebSocket;

  mainPeer;
  peer;

  peerList: Array<[string, PeerMain]> = [];

  other;
  my;

  async presentAlert(handler1, handler2) {
    const alert = await this.alertController.create({
      header: "是否接听",
      message: "来自小三的电话",
      buttons: [
        {
          text: "取消",
          role: "cancel",
          handler: handler1,
        },
        {
          text: "接听",
          handler: handler2,
        },
      ],
    });
    await alert.present();
  }

  async login() {
    this.peerHelper.create(this.address);
    setInterval(() => {
      this.peerList = MainPeerHelper.instance.getPeerList();
    }, 2000);

    BusPeerHelper.instance.on("offer", ({ businessId, otherAddress, next }) => {
      let peer = BusPeerHelper.instance.getBusPeer(otherAddress, businessId);

      peer.on("track", (e) => {
        this.other = e.streams[0];
      });

      const nextok = async () => {
        let stream = await navigator.mediaDevices.getUserMedia({ video: true });
        this.my = stream;
        peer.addTrack(stream);
        next();
      };
      this.presentAlert(
        () => {},
        () => {
          nextok();
        }
      );
    });
  }

  connet() {
    this.mainPeer = MainPeerHelper.instance.launch(this.otherAddress);
  }

  scanAddressList() {
    MainPeerHelper.instance.scanAddressList();
  }

  async call() {
    let businessId = Math.random().toString();
    let peer = BusPeerHelper.instance.getBusPeer(this.otherAddress, businessId);
    peer.on("track", (e) => {
      this.other = e.streams[0];
    });
    let stream = await navigator.mediaDevices.getUserMedia({ video: true });
    peer.addTrack(stream);
    BusPeerHelper.instance.offer(this.otherAddress, businessId);
    this.my = stream;
    console.info(peer);
    this.peer = peer;
  }

  send() {
    this.peer.channelSend(this.message);
    // PeerHelper.instance.send(this.otherAddress, this.message);
  }

  close() {
    this.peer.close();
    // PeerHelper.instance.getPeer(this.otherAddress).close();
  }

  showPeer(peer) {
    console.info(peer);
  }
}
