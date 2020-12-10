import { Id } from "./id";

export class Contact {
  id: Id;
  endpoint?: string;
  constructor(id: Id, endpoint?: string) {
    this.id = id;
    this.endpoint = endpoint;
  }

  toString(short: boolean) {
    let ids = this.id.toString(short);
    if (typeof this.endpoint === "undefined") return ids;
    return `${ids}/${this.endpoint}`;
  }
}
