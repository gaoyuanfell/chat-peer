import { Subject } from "rxjs";
import type { DataBlockType } from "./enum";

export const p2p$ = new Subject<[string, ArrayBuffer]>();

export const send$ = new Subject<ArrayBuffer>();

export const transport$ = new Subject<{ from: string; type: DataBlockType; buffer: ArrayBuffer }>();
