import { Injectable } from "@angular/core";
import { encodeMessage, MsgTypes, TransferMessage } from "chat-peer-models";
import { DataBlockType } from "src/common/enum";
import { P2pService } from "./p2p.service";

const DATAPACK_VERSION = 1;

export interface IDataBlock {
  type: DataBlockType;
  payload: ArrayBuffer;
}

@Injectable({
  providedIn: "root",
})
export class TransportService {
  constructor(private p2p: P2pService) {}

  send(receiver: string, blocks: IDataBlock[]) {
    let pack = this.createDataPack(blocks);
    this.writeBlocks(pack.buffer, blocks);

    let msg = new TransferMessage({ to: receiver, data: pack });
    let sendData = encodeMessage(MsgTypes.TRANSFER, msg);

    this.p2p.send(sendData);
  }

  createDataPack(blocks: IDataBlock[]) {
    const sumLength = blocks.reduce((p, c) => p + c.payload.byteLength + 1 + 4, 0) + 16;
    const pack = new Uint8Array(sumLength);
    const version = new Uint32Array(pack.buffer, 0, 1);
    version[0] = DATAPACK_VERSION;
    const count = new Uint16Array(pack.buffer, 4, 1);
    count[0] = blocks.length;
    return pack;
  }

  writeBlocks(buffer: ArrayBuffer, blocks: IDataBlock[]) {
    const index = new Uint32Array(buffer, 16, blocks.length);
    const payload = new Uint8Array(buffer, 16 + blocks.length * 4);
    let offset = 0;
    for (let i = 0; i < blocks.length; i++) {
      const block = blocks[i];
      index[i] = offset;
      payload[offset] = block.type;
      payload.set(new Uint8Array(block.payload), offset + 1);
      offset += block.payload.byteLength + 1;
    }
  }

  reveive(from: string, data: ArrayBuffer) {
    const version = new Uint32Array(data, 0, 1);
    const count = new Uint16Array(data, 4, 1)[0];
    const index = new Uint32Array(data, 16, count);
    const payload = new Uint8Array(data, 16 + count * 4);
    const headLen = 16 + count * 4;
    for (let i = 0; i < index.length; i++) {
      const offset = index[i];
      const type = payload[offset];
      const end = i === index.length - 1 ? payload.length : index[i + 1];
      const blockBuf = data.slice(offset + headLen + 1, end + headLen);
      console.info(from, type, blockBuf);
    }
  }
}
