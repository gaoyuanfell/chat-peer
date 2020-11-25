import {
  AbstractPeerServer,
  DataBlockType,
  decodeMessage,
  encodeMessage,
  IDataBlock,
  MsgTypes,
  packForwardBlocks,
  pickTypedArrayBuffer,
  TransferMessage,
  unpackForwardBlocks,
} from "chat-peer-models";

export class SocketService extends AbstractPeerServer {
  constructor() {
    super();
  }

  wss: WebSocket;
  port: number = 1129;
  connent() {
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
        switch (typeArr[0]) {
          case MsgTypes.TRANSFER:
            this.onTransfer(data);
            break;
        }
      };
      wss.onerror = (e) => {
        reject(e);
      };
    });
  }

  onTransfer(data: ArrayBuffer) {
    let dataArr = new Uint8Array(data, 1);
    let msg = decodeMessage(MsgTypes.TRANSFER, dataArr);
    unpackForwardBlocks(pickTypedArrayBuffer(msg.data), ({ type, buffer }) => {
      this.message({ type, buffer, from: msg.from });
    });
  }

  send(receiver: string, from: string, blocks: IDataBlock[]) {
    console.info(receiver);
    let pack = packForwardBlocks(blocks);

    let msg = new TransferMessage({ to: receiver, from: from, data: pack });
    let sendData = encodeMessage(MsgTypes.TRANSFER, msg);

    this.wssSend(sendData);
  }

  onMessage: (block: { type: DataBlockType; buffer: ArrayBuffer; from: string }) => any;
  wssSend(data: string | ArrayBuffer | SharedArrayBuffer | Blob | ArrayBufferView) {
    if (this.wss && this.wss.readyState !== 1) throw new Error("socket server did not start");
    this.wss.send(data);
  }
}
