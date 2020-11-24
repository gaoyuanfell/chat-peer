import { DataBlockType } from "./enum";
import { IDataBlock, PeerServer } from "./interface";

export abstract class AbstractPeerServer implements PeerServer {
  message(data: { type: DataBlockType; buffer: ArrayBuffer; from: string }) {
    this.onMessage(data);
  }
  abstract onMessage: (block: {
    type: DataBlockType;
    buffer: ArrayBuffer;
    from: string;
  }) => any;
  abstract connent(...args: unknown[]): any;
  abstract send(receiver: string, from: string, blocks: IDataBlock[]): any;
}
