import { Component } from "@angular/core";
import {
  decodeMessage,
  encodeMessage,
  MsgTypes,
  pickTypedArrayBuffer,
  TransferMessage,
  unpackForwardBlocks,
} from "chat-peer-models";
import { PeerService } from "src/services/peer.service";
import { SocketService } from "src/services/socket.service";
import { TransportService } from "src/services/transport.service";
import { UserService } from "src/services/user.service";

@Component({
  selector: "app-tab1",
  templateUrl: "tab1.page.html",
  styleUrls: ["tab1.page.scss"],
})
export class Tab1Page {
  address: string;
  otherAddress: string;
  message: string;

  constructor(
    private transport: TransportService,
    private peer: PeerService,
    private socket: SocketService,
    private user: UserService
  ) {}

  wss: WebSocket;

  async login() {
    let uint = encodeMessage(MsgTypes.LOGIN, {
      address: this.address,
    });
    await this.socket.connent();

    this.socket.onMessage = (data: ArrayBuffer) => {
      let typeArr = new Uint8Array(data, 0, 1);
      console.info(MsgTypes[typeArr[0]]);

      let dataArr = new Uint8Array(data.slice(1), 1);

      console.info(TransferMessage.decode(dataArr));

      let blocks = unpackForwardBlocks(TransferMessage.decode(dataArr).data.buffer);
      console.info(blocks);
    };

    this.socket.wssSend(uint);
    this.user.setCurrentAddress(this.address);
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

  connet() {
    this.peer.connect(this.otherAddress);
  }
}
