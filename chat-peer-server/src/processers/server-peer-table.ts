import { IMessageProcesser } from "../common/types";
import { processerManager } from "../helpers/processer-manager";
import type ws from "ws";
import { userManager } from "../helpers/user-manager";
import { decodeMessage, encodeMessage, MsgTypes, ServerPeerTableMessage } from "chat-peer-models";

class ServerPeerTable implements IMessageProcesser {
  process(data: Uint8Array, client: ws): void {
    let model = decodeMessage(MsgTypes.SERVICE_PEER_TABLE, data);
    let list = userManager.list().map(([key]) => key);
    let address = userManager.getAddress(client);
    let m = new ServerPeerTableMessage({
      businessId: model.businessId,
      addressList: list.filter((d) => d !== address),
    });
    let sendData = encodeMessage(MsgTypes.SERVICE_PEER_TABLE, m);
    client.send(sendData);
  }
}

processerManager.register(MsgTypes.SERVICE_PEER_TABLE, ServerPeerTable);
