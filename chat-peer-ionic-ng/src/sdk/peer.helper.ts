import { DataBlockType, encodeMessage, MsgTypes, PeerCandidate, PeerDescription, PeerServer } from "chat-peer-models";
import { Peer } from "./peer";
import { Pool } from "./pool";
import { SocketService } from "./socket";

const peerHelperSymbol = Symbol("PeerHelper");
export class PeerHelper {
  #pool: Pool;
  #socket: SocketService;

  constructor() {
    if (!PeerHelper[peerHelperSymbol]) {
      PeerHelper[peerHelperSymbol] = this;
    }
    return PeerHelper[peerHelperSymbol];
  }

  [peerHelperSymbol]: PeerHelper;

  static get instance() {
    return new PeerHelper();
  }

  getPeer(address: string) {
    if (!address) throw new Error("address connot be empty");
    return this.#pool.get(address);
  }

  getPeerList() {
    return this.#pool.getAll();
  }

  /**
   * 等待连接
   */
  waitingConnection(address: string) {
    this.#pool = new Pool(address);

    /**
     * 信令服务 socket
     */
    this.#socket = new SocketService();
    this.#socket.connent().then(() => {
      let uint = encodeMessage(MsgTypes.LOGIN, {
        address: address,
      });
      this.#socket.wssSend(uint);
    });

    this.#socket.onMessage = ({ type, buffer, from }) => {
      let peer: Peer = this.#pool.get(from);
      this.peerBindSendServer(peer);
      switch (type) {
        case DataBlockType.OFFER:
          peer.offerHandler(PeerDescription.decode(new Uint8Array(buffer)).toJSON(), from);
          break;
        case DataBlockType.ANSWER:
          peer.answerHandler(PeerDescription.decode(new Uint8Array(buffer)).toJSON());
          break;
        case DataBlockType.CANDIDATE:
          peer.candidateHandler(PeerCandidate.decode(new Uint8Array(buffer)).toJSON());
          break;
      }
    };
  }

  /**
   * 主动发起连接
   */
  launch(address: string) {
    if (this.#pool.address === address) return;
    let peer: Peer = this.#pool.get(address);
    if (peer.connectionState === "connected") return;

    this.peerBindSendServer(peer);
    peer.launchPeer(address);
  }

  private peerBindSendServer(peer: Peer) {
    if (!peer.hasBindSendServer) {
      peer.hasBindSendServer = true;
      peer.on("sendAnswer", ({ to, from, block }) => {
        this.#socket.send(to, from, [block]);
      });
      peer.on("sendOffer", ({ to, from, block }) => {
        this.#socket.send(to, from, [block]);
      });
      peer.on("sendCandidate", ({ to, from, block }) => {
        this.#socket.send(to, from, [block]);
      });
      peer.on("closed", () => {
        console.info("closed");
        this.#pool.remove(peer.to);
      });
    }
  }

  create(address: string) {
    this.waitingConnection(address);

    // const a = function () {}.bind(this);
    // let socket = new SocketService();
    // socket.connent().then(() => {
    //   let uint = encodeMessage(MsgTypes.LOGIN, {
    //     address: address,
    //   });
    //   socket.wssSend(uint);
    // });
    // PeerHelper.currentPeer.registerServer(socket);

    // PeerHelper.currentPeer.on("connected", () => {
    //   instace.pool.set(peer.to, peer);
    //   socket.wss.close();
    // });
    // PeerHelper.currentPeer.on("disconnected", () => {
    //   instace.pool.delete(peer.to);
    // });

    // PeerHelper.currentPeer.on("closed", () => {
    //   console.info("closed");
    // });
  }

  //   static getPeer(otherAddress: string) {
  //     let instace = PeerHelper.instance;
  //     let peer = instace.pool.get(otherAddress);
  //     if (!peer) {
  //       return PeerHelper.currentPeer;
  //     }
  //     return peer;
  //   }

  //   static getPeerList() {
  //     let instace = PeerHelper.instance;
  //     return [...instace.pool.entries()].map(([key, peer]) => {
  //       return {
  //         key,
  //         peer,
  //       };
  //     });
  //   }
}
