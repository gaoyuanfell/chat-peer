import { NgModule } from "@angular/core";
import { PreloadAllModules, RouterModule, Routes } from "@angular/router";
import { AuthGuard } from "src/services/auth-guard";

const routes: Routes = [
  {
    path: "tabs",
    // canLoad: [AuthGuard],
    // canActivate: [AuthGuard],
    // canActivateChild: [AuthGuard],
    loadChildren: () => import("./tabs/tabs.module").then((m) => m.TabsPageModule),
  },
  {
    path: "contact",
    // canLoad: [AuthGuard],
    // canActivate: [AuthGuard],
    // canActivateChild: [AuthGuard],
    loadChildren: () => import("./contact/contact.module").then((m) => m.ContactPageModule),
  },
  {
    path: "chats",
    // canLoad: [AuthGuard],
    // canActivate: [AuthGuard],
    canActivateChild: [AuthGuard],
    loadChildren: () => import("./chats/chats.module").then((m) => m.ChatsPageModule),
  },
  {
    path: "login",
    loadChildren: () => import("./login/login.module").then((m) => m.LoginPageModule),
  },
  // {
  //   path: "chats/index",
  //   canActivate: [AuthGuard],
  //   loadChildren: () => import("./chats/index/index.module").then((m) => m.IndexPageModule),
  // },
  // {
  //   path: "chats/chat",
  //   canActivate: [AuthGuard],
  //   loadChildren: () => import("./chats/chat/chat.module").then((m) => m.ChatPageModule),
  // },
  // {
  //   path: "chats/network",
  //   canActivate: [AuthGuard],
  //   loadChildren: () => import("./chats/network/network.module").then((m) => m.NetworkPageModule),
  // },
  {
    path: "",
    redirectTo: "/login",
    pathMatch: "full",
  },
];
@NgModule({
  imports: [RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules, relativeLinkResolution: "legacy" })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
