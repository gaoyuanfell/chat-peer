import { Component } from "@angular/core";
import { decodeMessage, encodeMessage, MsgTypes, pickTypedArrayBuffer } from "chat-peer-models";
import { P2pService } from "src/services/p2p.service";
import { TransportService } from "src/services/transport.service";

@Component({
  selector: "app-tab1",
  templateUrl: "tab1.page.html",
  styleUrls: ["tab1.page.scss"],
})
export class Tab1Page {
  address: string;
  otherAddress: string;
  message: string;

  constructor(private transport: TransportService, private p2p: P2pService) {}

  wss: WebSocket;

  async login() {
    let uint = encodeMessage(MsgTypes.LOGIN, {
      address: this.address,
    });

    this.p2p.send(uint);
  }

  send() {
    let blocks = [];
    for (let index = 0; index < 2; index++) {
      let t1 = new ArrayBuffer(1);
      let T1 = new Uint8Array(t1);
      T1[0] = index;
      blocks.push({
        type: index,
        payload: t1,
      });
    }

    this.transport.send(this.otherAddress, blocks);
  }
}
