import { ISubscribe } from "./interface";

export class Subscribe<Q> implements ISubscribe<Q> {
  private map = new Map<keyof Q, Array<(ev: Q[keyof Q]) => any>>();

  emit<T extends keyof Q>(type: T, data?: Q[T]) {
    let fnArr = this.map.get(type);
    if (fnArr) {
      fnArr.forEach((fn) => {
        fn.bind(this)(data as any);
      });
    }
  }

  on<T extends keyof Q>(
    type: T,
    listener: (this: Subscribe<Q>, ev: Q[T]) => any
  ) {
    let fnArr = this.map.get(type);
    if (!fnArr) fnArr = [];
    fnArr.push(listener as any);
    this.map.set(type, fnArr);
    return () => {
      this.delete(type, listener);
    };
  }

  once<T extends keyof Q>(
    type: T,
    listener: (this: Subscribe<Q>, ev: Q[T]) => any
  ) {
    let fnArr = this.map.get(type);
    if (!fnArr) fnArr = [];

    let _fn = (data: Q[T]) => {
      listener.apply(this, [data]);
      if (!fnArr) return;
      let index = fnArr.indexOf(_fn as any);
      if (index !== -1) fnArr.splice(index, 1);
    };

    fnArr.push(_fn as any);
    this.map.set(type, fnArr);
  }

  delete<T extends keyof Q>(
    type: T,
    listener: (this: Subscribe<Q>, ev: Q[T]) => any
  ) {
    let fnArr = this.map.get(type);
    if (!fnArr) return;
    let index = fnArr.indexOf(listener as any);
    if (index !== -1) {
      fnArr.splice(index, 1);
    }
  }

  clear() {
    this.map.clear();
  }
}
