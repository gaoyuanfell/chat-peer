import { Injectable } from "@angular/core";

@Injectable({
  providedIn: "root",
})
export class UserService {
  getCurrentAddress() {
    return localStorage.getItem("USER_ADDRESS");
  }

  setCurrentAddress(address: string) {
    localStorage.setItem("USER_ADDRESS", address);
  }
}
