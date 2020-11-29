import { Field, Message, Type } from "protobufjs/light";

@Type.d("ServerPeerTableMessage")
export class ServerPeerTableMessage extends Message<ServerPeerTableMessage> {
  static INC: number = 1;
  @Field.d(ServerPeerTableMessage.INC++, "string", "repeated")
  addressList!: string[];
  @Field.d(ServerPeerTableMessage.INC++, "string")
  businessId!: string;
}
