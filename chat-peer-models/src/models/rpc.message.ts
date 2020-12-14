import { Field, Message, Type } from "protobufjs/light";

@Type.d("RPCrequestMessage")
export class RPCrequestMessage extends Message<RPCrequestMessage> {
  static INC: number = 1;
  @Field.d(RPCrequestMessage.INC++, "string")
  method!: string;
  @Field.d(RPCrequestMessage.INC++, "string", "repeated")
  args!: string[];
  @Field.d(RPCrequestMessage.INC++, "string")
  businessId!: string;
}

@Type.d("RPCresponseMessage")
export class RPCresponseMessage extends Message<RPCresponseMessage> {
  static INC: number = 1;
  @Field.d(RPCresponseMessage.INC++, "bytes")
  data!: Uint8Array;
}

@Type.d("RPCfindNodeMessage")
export class RPCfindNodeMessage extends Message<RPCfindNodeMessage> {
  static INC: number = 1;
  @Field.d(RPCfindNodeMessage.INC++, "string", "repeated")
  contacts!: string[];
  @Field.d(RPCresponseMessage.INC++, "string")
  businessId!: string;
}

@Type.d("RPCPongMessage")
export class RPCPongMessage extends Message<RPCPongMessage> {
  static INC: number = 1;
  @Field.d(RPCPongMessage.INC++, "string")
  businessId!: string;
  @Field.d(RPCPongMessage.INC++, "string")
  address!: string;
}
