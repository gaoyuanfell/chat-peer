import {
  AbstractPeerServer,
  DataBlockType,
  decodeMessage,
  encodeMessage,
  IDataBlock,
  MsgTypes,
  packForwardBlocks,
  pickTypedArrayBuffer,
  promiseOut,
  TransferMessage,
  unpackForwardBlocks,
} from "chat-peer-models";

export class SocketService extends AbstractPeerServer {
  constructor() {
    super();
  }

  wss: WebSocket | undefined;
  port: number = 1129;
  connent() {
    return new Promise<WebSocket>((resolve, reject) => {
      let url = `${location.protocol === "http:" ? "ws://" : "wss://"}${
        location.hostname
      }:${this.port}`;
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
        this.close();
      };
      wss.onmessage = (e) => {
        const data = e.data as ArrayBuffer;
        let typeArr = new Uint8Array(data, 0, 1);
        switch (typeArr[0]) {
          case MsgTypes.TRANSFER:
            this.onTransfer(data);
            break;
          // 获取信令服务器用户列表
          case MsgTypes.SERVICE_PEER_TABLE:
            this.onServerPeerList(data);
            break;
        }
      };
      wss.onerror = (e) => {
        reject(e);
      };
    });
  }

  private promiseMap = new Map();

  generatePromise<T>(businessId: string) {
    let p = promiseOut<T>();
    this.promiseMap.set(businessId, p);
    return p.promise;
  }

  /**
   * // TODO 需要考虑 promiseMap 存储的promise没有得到响应的问题，需要添加一个延时销毁的操作
   * @param data
   */
  onServerPeerList(data: ArrayBuffer) {
    let dataArr = new Uint8Array(data, 1);
    let msg = decodeMessage(MsgTypes.SERVICE_PEER_TABLE, dataArr);
    let p = this.promiseMap.get(msg.businessId);
    if (!p) return;
    p.resolve(msg.addressList);
    this.promiseMap.delete(msg.businessId);
  }

  onTransfer(data: ArrayBuffer) {
    let dataArr = new Uint8Array(data, 1);
    let msg = decodeMessage(MsgTypes.TRANSFER, dataArr);
    unpackForwardBlocks(
      pickTypedArrayBuffer(msg.data),
      ({ type, payload: buffer }) => {
        this.message({ type, buffer, otherAddress: msg.from });
      }
    );
  }

  send(receiver: string, from: string, blocks: IDataBlock[]) {
    let pack = packForwardBlocks(blocks);
    let msg = new TransferMessage({ to: receiver, from: from, data: pack });
    let sendData = encodeMessage(MsgTypes.TRANSFER, msg);
    this.wssSend(sendData);
  }

  onError!: () => any;
  onClose!: () => any;
  onMessage!: (block: {
    type: DataBlockType;
    buffer: ArrayBuffer;
    otherAddress: string;
  }) => any;
  wssSend(
    data: string | ArrayBuffer | SharedArrayBuffer | Blob | ArrayBufferView
  ) {
    if (this.wss && this.wss.readyState === 1) {
      this.wss.send(data);
      return;
    }
    throw new Error("socket server did not start");
  }
}
