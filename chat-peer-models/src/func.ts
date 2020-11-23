import { MsgTypes } from "./enum";
import { LoginMessage, LogoutMessage, TransferMessage } from "./models";

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
