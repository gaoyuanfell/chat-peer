import { Field, Message, Type } from "protobufjs/light";

@Type.d("TransferMessage")
export class TransferMessage extends Message<TransferMessage> {
  static INC: number = 1;
  @Field.d(TransferMessage.INC++, "string")
  to!: string;
  @Field.d(TransferMessage.INC++, "string")
  from!: string;
  @Field.d(TransferMessage.INC++, "bytes")
  data!: Uint8Array;
}
