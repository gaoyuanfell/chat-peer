import { Field, Message, Type } from "protobufjs/light";

@Type.d("LogoutMessage")
export class LogoutMessage extends Message<LogoutMessage> {
  static INC: number = 1;
  @Field.d(LogoutMessage.INC++, "string")
  address!: string;
}
