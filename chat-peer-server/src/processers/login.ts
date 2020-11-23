import { IMessageProcesser } from "../common/types";
import { processerManager } from "../helpers/processer-manager";
import type ws from "ws";
import { userManager } from "../helpers/user-manager";
import { decodeMessage, MsgTypes } from "chat-peer-models";

class LoginProcesser implements IMessageProcesser {
  process(data: Uint8Array, client: ws): void {
    let model = decodeMessage(MsgTypes.LOGIN, data);
    userManager.login(model.address, client);
    console.info(userManager.list().map(([key]) => key));
  }
}

processerManager.register(MsgTypes.LOGIN, LoginProcesser);
