import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { MainPeerHelper } from "src/sdk";
import { UserService } from "src/services/user.service";

@Component({
  selector: "app-login",
  templateUrl: "./login.page.html",
  styleUrls: ["./login.page.scss"],
})
export class LoginPage implements OnInit {
  constructor(private router: Router, private user: UserService) {}

  ngOnInit() {}

  address: string;

  login() {
    this.user.setCurrentAddress(this.address);

    MainPeerHelper.instance.create(this.address);
    this.router.navigate(["/chats"]);
  }
}
