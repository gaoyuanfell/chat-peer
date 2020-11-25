import { DataBlockType } from "chat-peer-models";
import { Subject } from "rxjs";

export const p2p$ = new Subject<[string, ArrayBuffer]>();

export const send$ = new Subject<ArrayBuffer>();

export const transport$ = new Subject<{ from: string; type: DataBlockType; buffer: ArrayBuffer }>();
