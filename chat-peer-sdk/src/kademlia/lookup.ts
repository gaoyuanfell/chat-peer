import { BUCKET_SIZE } from "./const";
import { Contact } from "./contact";
import { Id } from "./id";
import { LookupList } from "./lookup-list";
export class Lookup {
  _list: LookupList;
  _targetId: Id;

  constructor(targetId: Id, contacts: Contact[]) {
    this._targetId = targetId;
    this._list = new LookupList(targetId, BUCKET_SIZE);
    this._list.insertMany(contacts);
  }

  static proceed(targetId: Id, contacts: Contact[]) {
    let lookup = new Lookup(targetId, contacts);
    lookup.proceed();
  }

  proceed() {}
}
