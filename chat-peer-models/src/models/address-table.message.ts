import { Field, Message, Type } from "protobufjs/light";

@Type.d("AddressTableMessage")
export class AddressTableMessage extends Message<AddressTableMessage> {
  static INC: number = 1;
  @Field.d(AddressTableMessage.INC++, "string")
  addressList!: string[];
}
