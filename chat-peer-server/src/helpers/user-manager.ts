import type ws from "ws";

const userMgrSymbol = Symbol("UserManager");

export class UserManager {
  private static [userMgrSymbol]: UserManager;
  constructor() {
    if (!UserManager[userMgrSymbol]) {
      UserManager[userMgrSymbol] = this;
    }
    return UserManager[userMgrSymbol];
  }

  static get instance() {
    return new UserManager();
  }

  #userMap = new Map<string, ws>();
  #clientMap = new WeakMap<ws, string>();

  login(address: string, client: ws) {
    this.#userMap.set(address, client);
    this.#clientMap.set(client, address);
  }

  logout(address: string) {
    this.#userMap.delete(address);
  }

  get(address: string) {
    return this.#userMap.get(address);
  }

  getAddress(client: ws) {
    return this.#clientMap.get(client);
  }

  list() {
    return [...this.#userMap.entries()];
  }
}

export const userManager = UserManager.instance;
