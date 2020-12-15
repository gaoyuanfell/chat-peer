import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { AlertController, ModalController } from "@ionic/angular";
import { ChatResponseMessage, packForwardBlocks, PromiseOut } from "chat-peer-models";
import { BusPeerHelper } from "chat-peer-sdk";
import { VideoComponent } from "src/app/chats/video/video.component";
import { ChatDBModel, ChatType } from "src/common/db.helper";
import { BusMessageType } from "src/common/enum";
import { chatListUpdate$, mainPeer$ } from "src/common/subscribes";
import { UserService } from "./user.service";
import * as hash from "hash.js";

@Injectable({
  providedIn: "root",
})
export class ChatService {
  constructor(
    private router: Router,
    private modal: ModalController,
    private alert: AlertController,
    private user: UserService
  ) {}

  init() {
    mainPeer$.subscribe(({ type, payload, otherAddress }) => {
      this.mainMessage(type, payload, otherAddress);
    });
  }

  async addChat(chat: ChatDBModel) {
    let db = await this.user.getUserDB();
    let trs = db.transaction("chat", "readwrite");
    let store = trs.objectStore("chat");
    store.put(chat);
    await trs.done;
    chatListUpdate$.next();
  }

  async getChat(businessId: string) {
    let db = await this.user.getUserDB();
    let trs = db.transaction("chat", "readonly");
    let store = trs.objectStore("chat");
    store.index("businessId");
    return await store.get(businessId);
  }

  async getChatList() {
    let db = await this.user.getUserDB();
    let trs = db.transaction("chat", "readonly");
    let store = trs.objectStore("chat");
    let cursor = store.index("id").openCursor();
    let result: ChatDBModel[] = [];
    while (cursor) {
      let record = await cursor;
      if (!record || !record.value) break;
      result.push(record.value);
      cursor = record.continue();
    }
    return result;
  }

  mainMessage(type: number, payload: ArrayBuffer, otherAddress: string) {
    console.info(otherAddress, type, payload, BusMessageType[type]);
    switch (type) {
      case BusMessageType.CHAT_REQUEST:
        this.chatRequest(otherAddress, payload);
        break;
      case BusMessageType.CHAT_RESPONSE:
        this.chatResponse(otherAddress, payload);
        break;
      case BusMessageType.VIDEO_REQUEST:
        // 可以添加请求确认逻辑
        this.chatVideoRequest(otherAddress, payload);
        break;
      case BusMessageType.VIDEO_RESPONSE:
        this.chatVideResponse(otherAddress, payload);
    }
  }

  encodeChatId(userId1: string, userId2: string) {
    let id = userId1 > userId2 ? userId1 + userId2 : userId2 + userId1;
    return hash.sha256().update(id).digest("hex");
  }

  lunchChat(otherAddress: string, businessId?: string) {
    let chatId = businessId;
    if (!chatId) {
      chatId = this.encodeChatId(this.user.getCurrentAddress(), otherAddress);
    }
    let model = new ChatResponseMessage({
      businessId: chatId,
    });
    let arr = packForwardBlocks([
      { type: BusMessageType.CHAT_REQUEST, payload: new Uint8Array(ChatResponseMessage.encode(model).finish()).buffer },
    ]);
    BusPeerHelper.instance.send(otherAddress, arr.buffer);
  }

  async chatAgree(options: { header: string; message: string }) {
    let promise = new PromiseOut<boolean>();
    const alert = await this.alert.create({
      header: options.header,
      message: options.message,
      buttons: [
        {
          text: "取消",
          role: "cancel",
          handler: () => {
            promise.resolve(false);
          },
        },
        {
          text: "确定",
          handler: () => {
            promise.resolve(true);
          },
        },
      ],
    });
    alert.present();
    return promise.promise;
  }

  async chatRequest(otherAddress: string, payload: ArrayBuffer) {
    let msg = ChatResponseMessage.decode(new Uint8Array(payload));
    let businessId = msg.businessId;

    let chatModel = await this.getChat(businessId);
    let agree = true;
    if (!chatModel) {
      agree = await this.chatAgree({
        header: "提示",
        message: `是否接收【${otherAddress}】的会话邀请？`,
      });
    }

    let model = new ChatResponseMessage({
      businessId: businessId,
      agree: !!agree,
    });

    let arr = packForwardBlocks([
      {
        type: BusMessageType.CHAT_RESPONSE,
        payload: new Uint8Array(ChatResponseMessage.encode(model).finish()).buffer,
      },
    ]);
    BusPeerHelper.instance.send(otherAddress, arr);

    if (!agree) return;

    await this.addChat({
      id: businessId,
      businessId: businessId,
      name: businessId,
      member: [otherAddress],
      type: ChatType.SINGLE,
      time: Date.now(),
    });
  }

  async chatResponse(otherAddress: string, payload: ArrayBuffer) {
    let msg = ChatResponseMessage.decode(new Uint8Array(payload));
    let businessId = msg.businessId;

    if (!msg.agree) {
      let alert = await this.alert.create({
        header: "提示",
        message: "对方拒接了",
        buttons: [
          {
            text: "确定",
          },
        ],
      });
      await alert.present();
      return;
    }

    await this.addChat({
      id: businessId,
      businessId: businessId,
      name: businessId,
      member: [otherAddress],
      type: ChatType.SINGLE,
      time: Date.now(),
    });
    BusPeerHelper.instance.offer(otherAddress, msg.businessId);
  }

  // 视频处理
  async chatVideoRequest(otherAddress: string, payload: ArrayBuffer) {
    let businessId = Date.now().toString();

    let agree = await this.chatAgree({
      message: "",
      header: `是否接收【${otherAddress}】的视频邀请？`,
    });

    let model = new ChatResponseMessage({
      businessId: businessId,
      agree: !!agree,
    });

    let arr = packForwardBlocks([
      {
        type: BusMessageType.VIDEO_RESPONSE,
        payload: new Uint8Array(ChatResponseMessage.encode(model).finish()).buffer,
      },
    ]);
    BusPeerHelper.instance.send(otherAddress, arr);

    if (!agree) return;

    const start = async () => {
      let mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      let videoCom = await this.modal.create({
        component: VideoComponent,
        componentProps: {
          stream: mediaStream,
          otherAddress,
          businessId,
        },
      });
      await videoCom.present();
    };
    start();
  }

  async chatVideResponse(otherAddress: string, payload: ArrayBuffer) {
    let msg = ChatResponseMessage.decode(new Uint8Array(payload));
    if (!msg.agree) {
      let alert = await this.alert.create({
        header: "提示",
        message: "对方拒接了",
        buttons: [
          {
            text: "确定",
          },
        ],
      });
      await alert.present();
      return;
    }

    const start = async () => {
      let mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      let videoCom = await this.modal.create({
        component: VideoComponent,
        componentProps: {
          stream: mediaStream,
          otherAddress,
          businessId: msg.businessId,
        },
        backdropDismiss: false,
      });
      await videoCom.present();
      console.info("BusPeerHelper.instance.offer(otherAddress, msg.businessId);");
      BusPeerHelper.instance.offer(otherAddress, msg.businessId);
    };
    start();
  }
}
