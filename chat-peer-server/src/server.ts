import ws from "ws";
import express from "express";
import compression from "compression";
import history from "connect-history-api-fallback";
import https from "https";
import http from "http";
import fs from "fs";
import path from "path";
import { processerManager } from "./helpers/processer-manager";
import { MsgTypes } from "chat-peer-models";
import { userManager } from "./helpers/user-manager";

const port = 1129;
const isHttp = true;

const caPath = path.resolve("./ca");

export class Server {
  wss!: ws.Server;
  server!: https.Server | http.Server;
  constructor() {}

  bootstrap() {
    let app = express();

    app.use(history());

    app.use(compression());

    app.use(
      express.static("www", {
        maxAge: 86400000,
      })
    );

    if (isHttp) {
      this.server = http.createServer(app);
    } else {
      const options = {
        key: fs.readFileSync(path.resolve(caPath, "ca.key")),
        cert: fs.readFileSync(path.resolve(caPath, "ca.crt")),
      };
      this.server = https.createServer(options, app);
    }

    this.server.listen(port, () => {
      console.info(`express start port ${port}`);
    });

    this.wss = new ws.Server({ server: this.server, perMessageDeflate: false });

    this.wss.on("connection", (ws) => {
      this.bindWsEvent(ws);
    });
  }

  bindWsEvent(clien: ws) {
    console.info("clien connection");
    clien.on("close", () => {
      const address = userManager.getAddress(clien);
      console.info(`logout user = ${address}`);
      if (address) {
        userManager.logout(address);
      }
    });
    clien.on("message", (msg: ArrayBuffer) => {
      let type = new Uint8Array(msg, 0, 1);
      console.info(`message type = ${MsgTypes[type[0]]}`);
      try {
        let dataArr = new Uint8Array(msg.slice(1), 1);
        const processer = processerManager.getProcesser(type[0]);
        processer.process(dataArr, clien);
      } catch (error) {
        console.error(error);
      }
    });
  }
}
