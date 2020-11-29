import { Injectable } from "@angular/core";
import {
  CanActivate,
  CanActivateChild,
  CanLoad,
  CanDeactivate,
  Router,
  ActivatedRouteSnapshot,
  UrlTree,
  Route,
  UrlSegment,
  RouterStateSnapshot,
} from "@angular/router";
import { Observable } from "rxjs";
import { MainPeerHelper } from "src/sdk";
import { UserService } from "./user.service";

@Injectable({ providedIn: "root" })
export class AuthGuard implements CanActivate, CanActivateChild, CanLoad, CanDeactivate<any> {
  constructor(private router: Router, private user: UserService) {}

  canLoadFun() {
    let socket = MainPeerHelper.instance.socket;
    if (!socket) return this.router.navigate(["/login"]);
    return true;
  }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> {
    console.info("canActivate");
    return this.canLoadFun();
  }
  canActivateChild(
    childRoute: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> {
    console.info("canActivateChild");
    return this.canLoadFun();
  }
  canLoad(
    route: Route,
    segments: UrlSegment[]
  ): boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> {
    console.info("canLoad");
    return this.canLoadFun();
  }
  canDeactivate(
    component: any,
    currentRoute: ActivatedRouteSnapshot,
    currentState: RouterStateSnapshot,
    nextState?: RouterStateSnapshot
  ): boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> {
    console.info("canDeactivate");
    return this.canLoadFun();
  }
}
