export interface IMessageProcesserCtor {
  new (): IMessageProcesser;
  instance?: IMessageProcesser;
}

export interface IMessageProcesser {
  process(...args: unknown[]): void;
}
