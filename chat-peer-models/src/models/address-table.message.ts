import { Field, Message, Type } from "protobufjs/light";

export enum AddressTableTypeMessage {
  REQUEST,
  RESPONSE,
}

@Type.d("AddressTableMessage")
export class AddressTableMessage extends Message<AddressTableMessage> {
  static INC: number = 1;
  @Field.d(AddressTableMessage.INC++, "string")
  addressList!: string[];
  @Field.d(AddressTableMessage.INC++, AddressTableTypeMessage)
  type!: AddressTableTypeMessage;
  @Field.d(AddressTableMessage.INC++, "string")
  receiver!: string;
}
