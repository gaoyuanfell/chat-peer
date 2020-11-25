import { Field, Message, Type } from "protobufjs/light";

@Type.d("BridegMessage")
export class BridegMessage extends Message<BridegMessage> {
  static INC: number = 1;
  @Field.d(BridegMessage.INC++, "string")
  to!: string;
  @Field.d(BridegMessage.INC++, "string")
  from!: string;
  @Field.d(BridegMessage.INC++, "bytes")
  data!: Uint8Array;
}
