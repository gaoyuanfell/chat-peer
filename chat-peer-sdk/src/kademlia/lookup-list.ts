import type { Contact } from "./contact";
import { Id } from "./id";

type LookupSlot = {
  contact: Contact;
  processed: boolean;
};

export class LookupList {
  constructor(id: Id, capacity: number) {
    this._capacity = capacity;
    this._id = id;
  }

  _capacity;
  _id;
  _slots: LookupSlot[] = [];

  get length() {
    return this._slots.length;
  }

  get capacity() {
    return this._capacity;
  }

  next() {
    for (let i = 0; i < this._slots.length; ++i) {
      if (!this._slots[i].processed) {
        this._slots[i].processed = true;
        return this._slots[i].contact;
      }
    }
    return null;
  }

  insertMany(contacts: Contact[]) {
    for (let index = 0; index < contacts.length; index++) {
      const contact = contacts[index];
      this.insert(contact);
    }
  }

  insert(contact: Contact) {
    for (let index = 0; index < this._slots.length; index++) {
      const slot = this._slots[index];
      let res = this._id.compareDistance(contact.id, slot.contact.id);
      if (res === 0) return;
      if (res < 0) continue;
      this._slots.splice(index, 0, { contact: contact, processed: false });
      if (this._slots.length > this._capacity) this._slots.pop();
      return;
    }
    if (this._slots.length < this._capacity)
      this._slots.push({ contact: contact, processed: false });
  }

  remove(contact: Contact) {
    for (let i = 0; i < this._slots.length; ++i) {
      let slot = this._slots[i];
      let res = this._id.compareDistance(contact.id, slot.contact.id);
      if (res > 0) return false;
      if (res < 0) continue;
      this._slots.splice(i, 1);
      return true;
    }
    return false;
  }

  find(contact: Contact) {
    for (let i = 0; i < this._slots.length; ++i) {
      let slot = this._slots[i];
      let res = this._id.compareDistance(contact.id, slot.contact.id);
      if (res > 0) return null;
      if (res < 0) continue;
      return this._slots[i];
    }
    return null;
  }

  getContacts() {
    return this._slots.map((slot) => slot.contact);
  }

  toString(short: boolean) {
    let res = "<[ ";
    for (let i = 0; i < this._slots.length; ++i) {
      res += this._slots[i].processed ? "[X]" : "[ ]";
      res += this._slots[i].contact.toString(short) + " ";
    }
    if (this._slots.length < this._capacity)
      res += ":" + (this._capacity - this._slots.length) + ": ";
    res += "]>";
    return res;
  }
}
