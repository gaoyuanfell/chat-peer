import { Injectable } from "@angular/core";
import { MsgTypes, decodeMessage, pickTypedArrayBuffer } from "chat-peer-models";
import { TransportService } from "./transport.service";

@Injectable({
  providedIn: "root",
})
export class P2pService {
  constructor(private transport: TransportService) {}

  wss: WebSocket;

  connent() {
    if (this.wss) return this.wss;
    return new Promise<WebSocket>((resolve, reject) => {
      let wss = new WebSocket(`ws://localhost:1129`);
      wss.binaryType = "arraybuffer";
      wss.onopen = (e) => {
        this.wss = wss;
        resolve(wss);
      };
      wss.onclose = (e) => {
        this.wss.close();
        this.wss = undefined;
      };
      wss.onmessage = (e) => {
        console.info(e);
        const data = e.data as ArrayBuffer;

        const typeArr = new Uint8Array(data, 0, 1);
        console.info(`message type = ${MsgTypes[typeArr[0]]}`);

        let model = decodeMessage(MsgTypes.TRANSFER, new Uint8Array(data, 1));
        this.transport.reveive(model.from, pickTypedArrayBuffer(model.data));
      };
      wss.onerror = (e) => {
        reject(e);
      };
    });
  }

  async send(data: ArrayBuffer) {
    await this.connent();
    this.wss.send(data);
  }
}
