import { Injectable } from "@angular/core";
import { getDB } from "src/common/db.helper";

@Injectable({
  providedIn: "root",
})
export class UserService {
  address: string;

  getCurrentAddress() {
    return this.address;
    // return localStorage.getItem("USER_ADDRESS");
  }

  setCurrentAddress(address: string) {
    this.address = address;
    // localStorage.setItem("USER_ADDRESS", address);
  }

  getUserDB() {
    return getDB(this.address);
  }
}
