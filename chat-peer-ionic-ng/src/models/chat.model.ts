import { Field, Message, Type } from "protobufjs/light";

@Type.d("ChatResponseMessage")
export class ChatResponseMessage extends Message<ChatResponseMessage> {
  static INC: number = 1;
  @Field.d(ChatResponseMessage.INC++, "string")
  businessId!: string;
  @Field.d(ChatResponseMessage.INC++, "bool")
  agree!: boolean;
}
