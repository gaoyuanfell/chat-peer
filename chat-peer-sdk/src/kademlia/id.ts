import hash from "hash.js";

export class Id {
  static SIZE = 20;
  static BIT_SIZE = Id.SIZE * 8;

  static SHORT_STR_PRE_LEN = 5;
  static SHORT_STR_SUF_LEN = 2;

  _key!: string;
  _buf: ArrayBuffer;
  get _uint() {
    return new Uint8Array(this._buf);
  }

  constructor(buf: ArrayBuffer) {
    this._buf = buf;
  }

  static fromKey(key: string) {
    let arr = hash.sha1().update(key).digest();
    let a = new ArrayBuffer(arr.length);
    let u = new Uint8Array(a);
    for (let index = 0; index < arr.length; index++) {
      u[index] = arr[index];
    }
    let id = new Id(a);
    id._key = key;
    return id;
  }

  static zero() {
    let a = new ArrayBuffer(Id.SIZE);
    let u = new Uint8Array(a);
    for (let i = 0; i < Id.SIZE; i++) {
      u[i] = 0;
    }
    return new Id(a);
  }

  static generate() {
    return Id.fromKey(`${Date.now() + Math.random()}`);
  }

  /**
   *
   * @param other 计算与 other 的距离
   */
  distanceTo(other: Id) {
    let res = new ArrayBuffer(Id.SIZE);
    let arr = new Uint8Array(res);
    for (let i = 0; i < Id.SIZE; ++i) {
      arr[i] = this._uint[i] ^ other._uint[i];
    }
    return res;
  }

  /**
   * 计算 两个id 与自身的距离比较近
   * 距离相同返回0
   * first比较近则大于0 反之
   * @param first
   * @param second
   */
  compareDistance(first: Id, second: Id) {
    for (let i = 0; i < Id.SIZE; i++) {
      let bt1 = this._uint[i] ^ first._uint[i];
      let bt2 = this._uint[i] ^ second._uint[i];
      if (bt1 > bt2) return -1;
      if (bt1 < bt2) return 1;
    }
    return 0;
  }

  /**
   * 判断 id 是否相同
   * @param other
   */
  equal(other: Id) {
    for (let i = 0; i < Id.SIZE; ++i) {
      if (this._uint[i] != other._uint[i]) return false;
    }
    return true;
  }

  /**
   * 提取指定索引处的位
   * @param i
   */
  at(i: number) {
    return (this._uint[(i / 8) | 0] & (1 << (7 - (i % 8)))) > 0;
  }

  toString(short?: boolean) {
    let hex = Array.prototype.map
      .call(this._uint, (x) => ("00" + x.toString(16)).slice(-2))
      .join("");
    if (short) {
      return `${hex.slice(0, Id.SHORT_STR_PRE_LEN)}..${hex.slice(
        hex.length - Id.SHORT_STR_SUF_LEN
      )}`;
    }
    return hex;
  }
}
