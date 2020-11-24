import { DataBlockType } from "./enum";

export interface IDataBlock {
  type: DataBlockType;
  payload: ArrayBuffer;
}

export interface PeerServer {
  message(data: unknown): any;
  onMessage: (block: {
    type: DataBlockType;
    buffer: ArrayBuffer;
    from: string;
  }) => any;
  connent(...args: unknown[]): any;
  send(receiver: string, from: string, blocks: IDataBlock[]): any;
}
