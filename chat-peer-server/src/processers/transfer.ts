import { decodeMessage, encodeMessage, MsgTypes } from "chat-peer-models";
import { IMessageProcesser } from "../common/types";
import { processerManager } from "../helpers/processer-manager";
import { userManager } from "../helpers/user-manager";

class TransferProcesser implements IMessageProcesser {
  process(data: Uint8Array): void {
    let model = decodeMessage(MsgTypes.TRANSFER, data);
    let targetClient = userManager.get(model.to);
    if (targetClient) {
      console.info(model);
      let sendData = encodeMessage(MsgTypes.TRANSFER, model);
      targetClient.send(sendData);
    }
  }
}

processerManager.register(MsgTypes.TRANSFER, TransferProcesser);
