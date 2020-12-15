import { Component, OnInit } from "@angular/core";
import { ModalController } from "@ionic/angular";
import { PeerService } from "src/services/peer.service";

@Component({
  selector: "app-contact",
  templateUrl: "./contact.page.html",
  styleUrls: ["./contact.page.scss"],
})
export class ContactPage implements OnInit {
  constructor(private modal: ModalController, private peer: PeerService) {}

  otherAddress;
  findAddress;
  targetAddress;

  find() {
    this.peer.rpc.findNode(this.otherAddress, this.findAddress).then((res) => {
      console.info(res);
    });
  }

  lookup() {
    this.peer.find(this.targetAddress).then((res) => {
      console.info(res);
    });
  }

  ngOnInit() {}

  async open() {}
}
