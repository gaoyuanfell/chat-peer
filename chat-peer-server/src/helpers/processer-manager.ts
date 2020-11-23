import { IMessageProcesser, IMessageProcesserCtor } from "../common/types";
import { MsgTypes } from "chat-peer-models";

const prsMgrSymbol = Symbol("ProcesserManager");
export class ProcesserManager {
  private static [prsMgrSymbol]: ProcesserManager;

  constructor() {
    if (!ProcesserManager[prsMgrSymbol]) {
      ProcesserManager[prsMgrSymbol] = this;
    }
    return ProcesserManager[prsMgrSymbol];
  }

  static get instance() {
    return new ProcesserManager();
  }

  #innerMap = new Map<MsgTypes, IMessageProcesserCtor>();
  register(type: MsgTypes, process: IMessageProcesserCtor) {
    if (this.#innerMap.has(type)) {
      return;
    }
    this.#innerMap.set(type, process);
  }

  getProcesser(type: MsgTypes) {
    if (!this.#innerMap.has(type)) {
      throw new Error(`Error: type ${type} processer not exists`);
    }
    const ctro = this.#innerMap.get(type)!;
    if (!ctro.instance) {
      ctro.instance = new ctro();
      ctro.instance.process = this.bindProcess(ctro.instance);
    }
    return ctro.instance;
  }

  private bindProcess(processer: IMessageProcesser) {
    const origin = processer.process.bind(processer);
    return function (...args: unknown[]) {
      try {
        origin(...args);
      } catch (error) {
        console.error(error);
      }
    };
  }
}

export const processerManager = ProcesserManager.instance;
