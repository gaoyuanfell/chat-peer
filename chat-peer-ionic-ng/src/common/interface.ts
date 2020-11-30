import { DataBusBlockType } from "./enum";

export interface IBusDataBlock {
  type: DataBusBlockType;
  payload: ArrayBuffer;
}
