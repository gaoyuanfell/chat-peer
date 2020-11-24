import { Injectable } from "@angular/core";
import {
  encodeMessage,
  MsgTypes,
  TransferMessage,
  packForwardBlocks,
  IDataBlock,
  decodeMessage,
  pickTypedArrayBuffer,
  unpackForwardBlocks,
} from "chat-peer-models";
import { DataBlockType } from "chat-peer-models/build/enum";
import { UserService } from "./user.service";

export interface PeerServer {
  message(data: unknown);
  onMessage: (block: { type: DataBlockType; buffer: ArrayBuffer }) => any;
  connent(...args: unknown[]);
  send(receiver: string, blocks: IDataBlock[]);
}

/**
 *
 */
abstract class AbstractPeerServer implements PeerServer {
  message(data: { type: DataBlockType; buffer: ArrayBuffer }) {
    console.info("ok");
    console.info(this.onMessage);
    this.onMessage(data);
  }
  abstract onMessage: (block: { type: DataBlockType; buffer: ArrayBuffer }) => any;
  abstract connent(...args: unknown[]);
  abstract send(receiver: string, blocks: IDataBlock[]);
}

/**
 * WebSocket 连接实现
 */

@Injectable({
  providedIn: "root",
})
export class SocketService extends AbstractPeerServer {
  constructor(private user: UserService) {
    super();
  }

  wss: WebSocket;
  port: number = 1129;
  connent() {
    if (this.wss) return this.wss;
    return new Promise<WebSocket>((resolve, reject) => {
      let url = `${location.protocol === "http:" ? "ws://" : "wss://"}${location.hostname}:${this.port}`;
      let wss = new WebSocket(url);
      wss.binaryType = "arraybuffer";
      wss.onopen = (e) => {
        this.wss = wss;
        resolve(wss);
      };
      wss.onclose = (e) => {
        if (this.wss && this.wss.readyState === 1) {
          this.wss.close();
        }
        this.wss = undefined;
      };
      wss.onmessage = (e) => {
        const data = e.data as ArrayBuffer;
        let typeArr = new Uint8Array(data, 0, 1);
        console.info(MsgTypes[typeArr[0]]);
        let dataArr = new Uint8Array(data, 1);
        let msg = decodeMessage(MsgTypes.TRANSFER, dataArr);
        unpackForwardBlocks(pickTypedArrayBuffer(msg.data), ({ type, buffer }) => {
          this.message({ type, buffer });
        });
      };
      wss.onerror = (e) => {
        reject(e);
      };
    });
  }

  send(receiver: string, blocks: IDataBlock[]) {
    console.info(receiver);
    let pack = packForwardBlocks(blocks);

    let msg = new TransferMessage({ to: receiver, from: this.user.getCurrentAddress(), data: pack });
    let sendData = encodeMessage(MsgTypes.TRANSFER, msg);

    this.wssSend(sendData);
  }

  onMessage: (block: { type: DataBlockType; buffer: ArrayBuffer }) => any;
  wssSend(data: string | ArrayBuffer | SharedArrayBuffer | Blob | ArrayBufferView) {
    if (this.wss && this.wss.readyState !== 1) throw new Error("socket server did not start");
    this.wss.send(data);
  }
}

// @Injectable({
//   providedIn: "root",
// })
// export class P2pService {
//   constructor() {}

//   wss: WebSocket;

//   connent() {
//     if (this.wss) return this.wss;
//     return new Promise<WebSocket>((resolve, reject) => {
//       let url = `${location.protocol === "http:" ? "ws://" : "wss://"}${location.hostname}:${port}`;
//       let wss = new WebSocket(url); // `ws://s331835e69.zicp.vip:1129`
//       wss.binaryType = "arraybuffer";
//       wss.onopen = (e) => {
//         this.wss = wss;
//         resolve(wss);
//       };
//       wss.onclose = (e) => {
//         if (this.wss && this.wss.readyState === 1) {
//           this.wss.close();
//         }
//         this.wss = undefined;
//       };
//       wss.onmessage = (e) => {
//         console.info(e);
//         const data = e.data as ArrayBuffer;

//         const typeArr = new Uint8Array(data, 0, 1);
//         console.info(`message type = ${MsgTypes[typeArr[0]]}`);

//         let model = decodeMessage(MsgTypes.TRANSFER, new Uint8Array(data, 1));

//         p2p$.next([model.from, pickTypedArrayBuffer(model.data)]);
//       };
//       wss.onerror = (e) => {
//         reject(e);
//       };
//     });
//   }

//   async send(data: ArrayBuffer) {
//     await this.connent();
//     this.wss.send(data);
//   }
// }
