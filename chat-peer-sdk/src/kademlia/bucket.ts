import { Contact } from "./contact";

/**
 * 
 *  (A ⊕ B)  == (B ⊕ A)：对称性，A到B的距离和B到A的距离是相等的。
    (A ⊕ A) == 0：节点自身与自身的距离是0
    (A ⊕ B) > 0 ：任意两个节点之间的距离一定大于0
    (A ⊕ B) + (B ⊕ C) >= (A ⊕ C)：三角不等，A经过B到C的距离总是大于等于A直接到C的距离
 * 
 * 
 * （1）映射规则
    Step1：先把key（如节点ID）以二进制形式表示，然后从高位到地位依次按Step2~Step3处理。
    Step2：二进制的第n位对应二叉树的第n层。
    Step3：如果当前位是1，进入右子树，如果是0则进入左子树（认为设定，可以反过来）。
    Step4：按照高位到地位处理完后，这个Key值就对应于二叉树上的某个叶子节点。
 * 
 * 
 * 
 * 
 * 
 * 
 */

/**
 * 存放 contact
 */
export class Bucket {
  _store: Contact[] = [];
  capacity: number;

  get length() {
    return this._store.length;
  }

  get oldest() {
    return this._store[0];
  }

  constructor(capacity: number) {
    if (capacity <= 0) throw new Error("invalid bucket capacity");
    this.capacity = capacity;
  }

  /**
   * 删除联系人
   * @param contact
   */
  remove(contact: Contact) {
    for (let i = 0; i < this._store.length; ++i) {
      if (this._store[i].id.equal(contact.id)) {
        this._store.splice(i, 1);
        return true;
      }
    }
    return false;
  }

  store(contact: Contact) {
    this.remove(contact);
    if (this._store.length == this.capacity) return false;
    this._store.push(contact);
    return true;
  }

  obtain(len: number = this._store.length) {
    if (this._store.length <= len) return this._store;
    return this._store.slice(0, len);
  }

  split(nth: number, left: Bucket, right: Bucket) {
    for (let i = 0; i < this._store.length; ++i) {
      let contact = this._store[i];
      if (contact.id.at(nth)) right.store(contact);
      else left.store(contact);
    }
  }

  toString() {
    var res = "<( ";
    for (var i = 0; i < this._store.length; ++i) {
      res += this._store[i].toString(true) + " ";
    }
    if (this.length < this.capacity)
      res += ":" + (this.capacity - this.length) + ": ";
    res += ")>";
    return res;
  }
}
