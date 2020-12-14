import { PromiseOut } from "chat-peer-models";
import { BUCKET_SIZE } from "./const";
import { Contact } from "./contact";
import { Id } from "./id";
import { LookupList } from "./lookup-list";
import { RPC } from "./rpc";
export class Lookup {
  _list: LookupList;
  _targetId: Id;
  _id: Id;
  _concurrents: number = 0;
  _rpc: RPC;

  constructor(id: Id, targetId: Id, contacts: Contact[], rpc: RPC) {
    this._id = id;
    this._targetId = targetId;
    this._rpc = rpc;
    this._list = new LookupList(targetId, BUCKET_SIZE);
    this._list.insertMany(contacts);
  }

  /**
   *
   * @param targetId 需要查找的 id 可以是自己
   * @param contacts
   * @param rpc
   */
  static proceed(id: Id, targetId: Id, contacts: Contact[], rpc: RPC) {
    let lookup = new Lookup(id, targetId, contacts, rpc);
    return lookup.proceed();
  }

  private proceed() {
    let p = new PromiseOut();
    const proceedFun = () => {
      // 获得的新地址 需要通过桥接建立连接
      // 这边通过用户主动收索获取他的路由表有助于完善社交圈
      let next = this._list.next();
      if (next != null) return this._forContact(next, proceedFun, p);

      --this._concurrents;
      if (this._concurrents === 0) {
        if (p.is_finished) return;
        p.resolve({
          bridge: null,
          contacts: this._list.getContacts(),
        });
        console.info(
          this._list
            .getContacts()
            .map((c) => c.toString() + ":" + c.id._key)
            .join("\n")
        );
      }
    };

    for (let index = 0; index < BUCKET_SIZE; index++) {
      let next = this._list.next();
      if (!next) break;
      ++this._concurrents;
      this._forContact(next, proceedFun, p);
    }
    if (this._concurrents === 0) {
      // 返回空数组
      p.resolve([]);
    }

    return p.promise;
  }

  async _forContact(
    contact: Contact,
    proceedFun: any,
    promise: PromiseOut<any>
  ) {
    try {
      await this._rpc.peerLaunch(contact.id._key);
      console.info("*****************连接成功****************");
    } catch (error) {}

    this._rpc.findNode(contact.id._key, this._targetId._key).then(
      (address) => {
        let contacts = address
          .map((d) => Id.fromKey(d))
          .filter((id) => !id.equal(this._id))
          .map((d) => new Contact(d));

        this._list.insertMany(contacts);

        // 如果找到了节点 就直接返回
        let res = this._list.find(new Contact(this._targetId));
        if (res) {
          if (promise.is_finished) return;
          promise.resolve({
            bridge: contact,
            contacts: [res],
          });
          return;
        }
        proceedFun();
      },
      () => {
        this._list.remove(contact);
        proceedFun();
      }
    );
  }
}
