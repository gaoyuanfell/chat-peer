import { Type, Message, Field } from "protobufjs";

@Type.d("PeerDescription")
export class PeerDescription extends Message<PeerDescription> {
  static INC: number = 1;

  @Field.d(PeerDescription.INC++, "string")
  sdp!: string;

  @Field.d(PeerDescription.INC++, "string")
  type!: string;
}
