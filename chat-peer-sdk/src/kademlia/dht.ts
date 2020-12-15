import { BUCKET_SIZE, CONCURRENCY } from "./const";
import { Contact } from "./contact";
import { Id } from "./id";
import { Lookup } from "./lookup";
import { RoutingTable } from "./routing-table";
import { RPC } from "./rpc";

export class DHT {
  _routes;
  _rpc: RPC;

  constructor(rpc: RPC, localId: Id) {
    this._rpc = rpc;
    this._routes = new RoutingTable(localId, BUCKET_SIZE);
  }

  /**
   * @param id
   */
  async discovered(id: Id) {
    let contact = new Contact(id);
    let oldContact = this._routes.store(contact);
    if (oldContact) {
      try {
        let address = await this._rpc.ping(oldContact.id._key);
        this._routes.store(new Contact(Id.fromKey(address)));
        console.info(`${id._key}被忽略了`);
      } catch (error) {
        this.remove(oldContact.id);
        this._routes.store(contact);
      }
    }
  }

  remove(id: Id) {
    let contact = new Contact(id);
    return this._routes.remove(contact);
  }

  /**
   * 根据查询目标在本地路由获取距离近的目标
   * // TODO 这个函数到底是什么场景才会用到的？
   * @param targetAddress 查询的目标
   * @deprecated
   */
  lookupKey(targetAddress: string) {
    let targetId = Id.fromKey(targetAddress);
    let contacts = this._routes.find(targetId, CONCURRENCY);
    Lookup.proceed(this._routes.id, targetId, contacts, this._rpc);
  }

  /**
   * 查找对应的节点 如果 bridge 有值 并且 contacts 数组只有一个 代表需要
   * @param targetAddress 目标节点
   */
  async find(targetAddress: string) {
    let targetId = Id.fromKey(targetAddress);
    let contacts = this._routes.find(targetId, CONCURRENCY);
    let res = contacts.filter((c) => c.id.equal(Id.fromKey(targetAddress)));
    if (res.length)
      return {
        bridge: null,
        contacts: res,
      };
    return Lookup.proceed(this._routes.id, targetId, contacts, this._rpc);
  }
}
