import { DataBlockType } from "chat-peer-models";
import { Subject } from "rxjs";
import { ChatDBModel } from "./db.helper";

// export const p2p$ = new Subject<[string, ArrayBuffer]>();

// export const send$ = new Subject<ArrayBuffer>();

// export const transport$ = new Subject<{ from: string; type: DataBlockType; buffer: ArrayBuffer }>();

export const mainPeer$ = new Subject<{ type: number; payload: ArrayBuffer; otherAddress: string }>();

export const chatListUpdate$ = new Subject();
