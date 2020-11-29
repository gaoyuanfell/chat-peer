import { ISubscribe } from "./interface";

export class Subscribe<Q> implements ISubscribe<Q> {
  #map = new Map<string, Function[]>();

  emit<T extends keyof Q>(type: T, data?: Q[T]) {
    let fnArr = this.#map.get(type as string);
    if (fnArr) {
      fnArr.forEach((fn) => {
        fn(data);
      });
    }
  }

  on<T extends keyof Q>(type: T, listener: (this: Subscribe<Q>, ev: Q[T]) => any) {
    let fnArr = this.#map.get(type as string);
    if (!fnArr) fnArr = [];
    fnArr.push(listener.bind(this));
    this.#map.set(type as string, fnArr);
    return () => {
      this.delete(type, listener);
    };
  }

  once<T extends keyof Q>(type: T, listener: (this: Subscribe<Q>, ev: Q[T]) => any) {
    let fnArr = this.#map.get(type as string);
    if (!fnArr) fnArr = [];

    let _fn = (data) => {
      listener.bind(this)(data);
      let index = fnArr.indexOf(_fn);
      if (index !== -1) fnArr.splice(index, 1);
    };

    fnArr.push(_fn);
    this.#map.set(type as string, fnArr);
  }

  delete<T extends keyof Q>(type: T, listener: (this: Subscribe<Q>, ev: Q[T]) => any) {
    let fnArr = this.#map.get(type as string);
    let index = fnArr.indexOf(listener);
    if (index !== -1) {
      fnArr.splice(index, 1);
    }
  }

  clear() {
    this.#map.clear();
  }
}
