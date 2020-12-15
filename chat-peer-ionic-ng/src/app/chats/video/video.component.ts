import { ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from "@angular/core";
import { ModalController, ViewWillLeave } from "@ionic/angular";
import { packForwardBlocks, unpackForwardBlocks } from "chat-peer-models";
import { PeerBus } from "chat-peer-sdk";
import { BusMessageType } from "src/common/enum";
import { PeerService } from "src/services/peer.service";

@Component({
  selector: "app-video",
  templateUrl: "./video.component.html",
  styleUrls: ["./video.component.scss"],
})
export class VideoComponent implements OnInit, OnDestroy, ViewWillLeave {
  constructor(private cdrf: ChangeDetectorRef, private modal: ModalController, private peerService: PeerService) {}

  @Input() stream: MediaStream;
  @Input() businessId: string;
  @Input() otherAddress: string;

  otherStream: MediaStream;

  peer: PeerBus;
  listeners = [];

  ngOnInit() {
    this.peer = this.peerService.busPeerHelper.getBusPeer(this.otherAddress, this.businessId);
    this.peer.addTrack(this.stream);
    this.listeners.push(
      this.peer.on("track", (event) => {
        console.info(event.streams[0]);
        this.otherStream = event.streams[0];
        this.cdrf.detectChanges();
      }),
      this.peer.on("closed", () => {
        console.info("closed");
      }),
      this.peer.on("connected", () => {
        console.info("连接成功");
      }),
      this.peer.on("message", (e) => {
        unpackForwardBlocks(e.data, ({ type }) => {
          switch (type) {
            case BusMessageType.VIDEO_HANGUP:
              this.modal.dismiss();
              break;
          }
        });
      })
    );
  }

  ngOnDestroy() {
    this.destroy();
  }

  ionViewWillLeave() {
    this.destroy();
  }

  hangup() {
    let arr = packForwardBlocks([{ type: BusMessageType.VIDEO_HANGUP, payload: new Uint8Array().buffer }]);
    this.peer.channelSend(arr.buffer);
    this.modal.dismiss();
  }

  onCanplay(ref: HTMLMediaElement) {
    ref.muted = true;
  }

  destroy() {
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }
    this.listeners.forEach((fn) => fn());
    if (!this.peer) return;
    if (this.peer.connected) {
      this.peer.close();
      this.peer = null;
    }
  }
}
