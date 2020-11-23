import { Field, Message, Type } from "protobufjs/light";

@Type.d("LoginMessage")
export class LoginMessage extends Message<LoginMessage> {
  static INC: number = 1;
  @Field.d(LoginMessage.INC++, "string")
  address!: string;
}
