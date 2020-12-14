import {
  DataBlockType,
  decodeMessage,
  MsgTypes,
  pickTypedArrayBuffer,
  PromiseOut,
  PromiseOutType,
  RPCfindNodeMessage,
  RPCPongMessage,
  unpackForwardBlocks,
} from "chat-peer-models";
import { PeerMain } from "../peer";
import { uuid } from "../util";

type RpcMethod = "findNode" | "onFindNode" | "ping" | "onPing" | "launch";

export class RPC {
  private _peerBusinessIdMap = new WeakMap<PeerMain, string>();

  private _handlers = new Map<RpcMethod, Function>();

  private _promiseMap = new Map<string, PromiseOutType<any>>();

  generatePromise<T>(businessId: string) {
    let p = new PromiseOut<T>();
    this._promiseMap.set(businessId, p);
    setTimeout(() => {
      p.reject(new Error(businessId + "business timeout"));
      this._promiseMap.delete(businessId);
    }, 5000);
    return p.promise;
  }

  receive(method: RpcMethod, fn: Function) {
    this._handlers.set(method, fn);
  }

  /**
   * 建立连接 // TODO 这个不是远程调用 暂时放在这里
   * @param otherAddress
   * @param bridgeAddress
   */
  peerLaunch(otherAddress: string, bridgeAddress?: string) {
    let businessId = uuid();
    let fn = this._handlers.get("launch");
    if (!(fn instanceof Function)) throw new Error("launch not fount");
    let p = this.generatePromise<PeerMain>(businessId);
    try {
      let peer: PeerMain = fn(otherAddress, bridgeAddress);
      if (peer.connected) {
        throw new Error(otherAddress + " connected successfully");
      }
      this._peerBusinessIdMap.set(peer, businessId);
    } catch (error) {
      let promise = this._promiseMap.get(businessId);
      if (!promise) throw new Error("promise not find");
      promise.reject(error);
      this._promiseMap.delete(businessId);
    }
    return p;
  }

  /**
   * 连接成功后通知自己 // TODO 这个不是远程调用 暂时放在这里
   * @param peer
   */
  onPeerLaunch(peer: PeerMain) {
    let businessId = this._peerBusinessIdMap.get(peer);
    this._peerBusinessIdMap.delete(peer);
    if (businessId) {
      let promise = this._promiseMap.get(businessId);
      if (!promise) throw new Error("promise not find");
      promise.resolve(peer);
      this._promiseMap.delete(businessId);
    }
  }

  /**
   * @param otherAddress 请求的地址
   * @param targetAddress 查询的目标
   */
  findNode(otherAddress: string, targetAddress: string) {
    return this.execFun<string[]>("findNode", otherAddress, targetAddress);
  }

  ping(otherAddress: string) {
    return this.execFun<string>("ping", otherAddress);
  }

  private execFun<T>(method: RpcMethod, ...args: any[]) {
    let businessId = uuid();
    let fn = this._handlers.get(method);
    args.push(businessId);
    if (!(fn instanceof Function)) throw new Error(method + " not fount");
    let p = this.generatePromise<T>(businessId);
    try {
      fn(...args);
    } catch (error) {
      let promise = this._promiseMap.get(businessId);
      if (!promise) throw new Error("promise not find");
      promise.reject(error);
      this._promiseMap.delete(businessId);
      return Promise.reject(error);
    }
    return p;
  }

  onRequestMessage(data: ArrayBuffer) {
    let dataArr = new Uint8Array(data, 1);
    let { method, args } = decodeMessage(MsgTypes.RPC_REQUEST_MESSAGE, dataArr);
    let fn = this._handlers.get(method);
    if (fn instanceof Function) {
      fn(...args);
    }
  }

  onResponseMessage(data: ArrayBuffer) {
    let dataArr = new Uint8Array(data, 1);
    let msg = decodeMessage(MsgTypes.RPC_RESPONSE_MESSAGE, dataArr);
    unpackForwardBlocks(
      pickTypedArrayBuffer(msg.data),
      ({ type, payload: buffer }) => {
        switch (type) {
          case DataBlockType.KAD_FINDNODE:
            this.onKadFindnode(buffer);
            break;
          case DataBlockType.KAD_PING:
            this.onKadPing(buffer);
            break;
          default:
            break;
        }
      }
    );
  }

  private onKadFindnode(buffer: ArrayBuffer) {
    let { contacts, businessId } = RPCfindNodeMessage.decode(
      new Uint8Array(buffer)
    );

    let promise = this._promiseMap.get(businessId);
    if (!promise) throw new Error("promise not find");
    promise.resolve(contacts);
    this._promiseMap.delete(businessId);
  }

  private onKadPing(buffer: ArrayBuffer) {
    let { address, businessId } = RPCPongMessage.decode(new Uint8Array(buffer));

    let promise = this._promiseMap.get(businessId);
    if (!promise) throw new Error("promise not find");
    promise.resolve(address);
    this._promiseMap.delete(businessId);
  }
}
