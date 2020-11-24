import { IDataBlock } from "./interface";
import { DataBlockType, MsgTypes } from "./enum";
import { LoginMessage, LogoutMessage, TransferMessage } from "./models";

const DATAPACK_VERSION = 1;

const createForwardDataPack = (blocks: IDataBlock[]) => {
  const sumLength =
    blocks.reduce((p, c) => p + c.payload.byteLength + 1 + 4, 0) + 16;
  const pack = new Uint8Array(sumLength);
  const version = new Uint32Array(pack.buffer, 0, 1);
  version[0] = DATAPACK_VERSION;
  const count = new Uint16Array(pack.buffer, 4, 1);
  count[0] = blocks.length;
  return pack;
};

const writeForwardBlocks = (buffer: ArrayBuffer, blocks: IDataBlock[]) => {
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
};

export const packForwardBlocks = (blocks: IDataBlock[]) => {
  let pack = createForwardDataPack(blocks);
  writeForwardBlocks(pack.buffer, blocks);
  return pack;
};

export const unpackForwardBlocks = (
  data: ArrayBuffer,
  blockFn: (block: { type: DataBlockType; buffer: ArrayBuffer }) => any
) => {
  const version = new Uint32Array(data, 0, 1);
  let blocks = [];
  if (DATAPACK_VERSION !== version[0]) {
    throw new Error("data buffer version disaccord");
  }
  const count = new Uint16Array(data, 4, 1)[0];
  const index = new Uint32Array(data, 16, count);
  const payload = new Uint8Array(data, 16 + count * 4);
  const headLen = 16 + count * 4;
  for (let i = 0; i < index.length; i++) {
    const offset = index[i];
    const type = payload[offset];
    const end = i === index.length - 1 ? payload.length : index[i + 1];
    const blockBuf = data.slice(offset + headLen + 1, end + headLen);
    let block = {
      type: type,
      buffer: blockBuf,
    };
    blockFn && blockFn(block);
    blocks.push(block);
  }
  return blocks;
};

type MessageTypeDict = {
  [MsgTypes.LOGIN]: LoginMessage;
  [MsgTypes.LOGOUT]: LogoutMessage;
  [MsgTypes.TRANSFER]: TransferMessage;
};

const messageTypeDict = {
  [MsgTypes.LOGIN]: LoginMessage,
  [MsgTypes.LOGOUT]: LogoutMessage,
  [MsgTypes.TRANSFER]: TransferMessage,
};

/**
 * 编码
 * @param type
 * @param data
 */
export const encodeMessage = <T extends MsgTypes, P = MessageTypeDict[T]>(
  type: T,
  msg: P
) => {
  const msgCtor = messageTypeDict[type];
  const uintArr = (msgCtor as any).encode(msg).finish() as Uint8Array;
  const res = new Uint8Array(uintArr.length + 1);
  res[0] = type;
  res.set(uintArr, 1);
  return res.buffer;
};

/**
 * 解码
 * @param type
 * @param data
 */
export const decodeMessage = <T extends MsgTypes, P = MessageTypeDict[T]>(
  type: T,
  data: Uint8Array
) => {
  const msgCtor = messageTypeDict[type];
  let model = (msgCtor as any).decode(data);
  return model as P;
};

export const pickTypedArrayBuffer = (bytes: Uint8Array) => {
  return bytes.buffer.slice(
    bytes.byteOffset,
    bytes.byteOffset + bytes.length * bytes.BYTES_PER_ELEMENT
  );
};
