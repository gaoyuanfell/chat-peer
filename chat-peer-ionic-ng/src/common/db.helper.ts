import { DBSchema, IDBPDatabase, openDB } from "idb";

export enum ChatType {
  SINGLE,
  GROUP,
}

export interface ChatDBModel {
  id: string;
  businessId: string;
  type: ChatType;
  member: string[];
  name: string;
  time: number;
}

export interface IPeerDBSchema extends DBSchema {
  chat: {
    value: ChatDBModel;
    key: string;
    indexes: {
      id: string;
      businessId: string;
    };
  };
}

const map = new Map<string, IDBPDatabase<IPeerDBSchema>>();

export const getDB = async (userId: string) => {
  let instence = map.get(userId);
  if (instence) return instence;

  let onResolve: (db: IDBPDatabase<IPeerDBSchema>) => void;
  let onReject: () => void;
  let dbName = "IMPEER_" + userId;
  let VERSION = 1;
  openDB<IPeerDBSchema>(dbName, VERSION, {
    blocked: () => {
      onReject();
    },
    upgrade: (db) => {
      const store = db.createObjectStore("chat", {
        autoIncrement: false,
        keyPath: "id",
      });
      store.createIndex("id", "id");
      store.createIndex("businessId", "businessId");
    },
    terminated: () => {
      map.delete(userId);
      onReject();
    },
  }).then((db) => {
    map.set(userId, db);
    onResolve(db);
  });

  return new Promise<IDBPDatabase<IPeerDBSchema>>((resolve, reject) => {
    onResolve = resolve;
    onReject = reject;
  });
};
