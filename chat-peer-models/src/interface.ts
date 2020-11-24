import { DataBlockType } from "./enum";

export interface IDataBlock {
  type: DataBlockType;
  payload: ArrayBuffer;
}
