import hash from "hash.js";

export const uuid = (key: string = Date.now().toString()) => {
  return hash
    .sha256()
    .update(Math.random().toString() + key)
    .digest("hex");
};
