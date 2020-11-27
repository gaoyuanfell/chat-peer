import { Field, Message, Type } from "protobufjs/light";

@Type.d("BusinessDataMessage")
export class BusinessDataMessage extends Message<BusinessDataMessage> {
  static INC: number = 1;
  @Field.d(BusinessDataMessage.INC++, "string")
  businessId!: string;
  @Field.d(BusinessDataMessage.INC++, "string")
  receiver!: string;
  @Field.d(BusinessDataMessage.INC++, "string")
  from!: string;
  @Field.d(BusinessDataMessage.INC++, "bytes")
  data!: Uint8Array;
}
