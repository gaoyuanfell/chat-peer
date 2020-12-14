import { Component, OnInit } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { Router } from "@angular/router";
import { NavController } from "@ionic/angular";
import { UserService } from "src/services/user.service";
import { PeerService } from "src/services/peer.service";

@Component({
  selector: "app-login",
  templateUrl: "./login.page.html",
  styleUrls: ["./login.page.scss"],
})
export class LoginPage implements OnInit {
  constructor(
    private router: Router,
    private user: UserService,
    private title: Title,
    private nav: NavController,
    private peer: PeerService
  ) {}

  ngOnInit() {
    this.login();
  }

  address: string;

  login() {
    // let t = this.title.getTitle();
    this.address = Math.floor(Math.random() * 1000000).toString();
    console.info(this.address);
    this.title.setTitle(`${this.address}`);
    this.user.setCurrentAddress(this.address);
    this.peer.create(this.address);
    this.router.navigate(["/chats"]);
    // this.nav.navigateForward(["/chats"]);
  }
}
