import { decodeMessage, MsgTypes } from "chat-peer-models";
import { IMessageProcesser } from "../common/types";
import { processerManager } from "../helpers/processer-manager";
import { userManager } from "../helpers/user-manager";

class LogoutProcesser implements IMessageProcesser {
  process(data: Uint8Array): void {
    let model = decodeMessage(MsgTypes.LOGOUT, data);
    userManager.logout(model.address);
  }
}

processerManager.register(MsgTypes.LOGOUT, LogoutProcesser);
