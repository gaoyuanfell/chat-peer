import { DataBlockType } from "./enum";
import { IDataBlock, PeerServer } from "./interface";

export abstract class AbstractPeerServer implements PeerServer {
  message(data: {
    type: DataBlockType;
    buffer: ArrayBuffer;
    otherAddress: string;
  }) {
    this.onMessage(data);
  }
  abstract onMessage: (block: {
    type: DataBlockType;
    buffer: ArrayBuffer;
    otherAddress: string;
  }) => any;
  abstract connent(...args: unknown[]): any;
  abstract send(receiver: string, from: string, blocks: IDataBlock[]): any;
}
