import { Field, Message, Type } from "protobufjs/light";

@Type.d("BridegMessage")
export class BridegMessage extends Message<BridegMessage> {
  static INC: number = 1;
  @Field.d(BridegMessage.INC++, "string")
  receiver!: string;
  @Field.d(BridegMessage.INC++, "string")
  to!: string;
  @Field.d(BridegMessage.INC++, "string")
  from!: string;
  @Field.d(BridegMessage.INC++, "string", "repeated")
  path!: string[]; // 桥接的路径 暂时只考虑了一个桥接点
  @Field.d(BridegMessage.INC++, "bytes")
  data!: Uint8Array;
}
