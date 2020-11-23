import { Type, Message, Field } from "protobufjs";

@Type.d("PeerCandidate")
export class PeerCandidate extends Message<PeerCandidate> {
  static INC: number = 0;

  @Field.d(PeerCandidate.INC++, "string")
  candidate!: string;

  @Field.d(PeerCandidate.INC++, "uint32")
  sdpMLineIndex!: number;

  @Field.d(PeerCandidate.INC++, "string")
  sdpMid!: string;

  @Field.d(PeerCandidate.INC++, "string")
  usernameFragment!: string;
}
