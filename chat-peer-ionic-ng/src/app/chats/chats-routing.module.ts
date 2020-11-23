import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";

import { ChatsPage } from "./chats.page";

const routes: Routes = [
  {
    path: "",
    component: ChatsPage,
    children: [
      {
        path: "index",
        loadChildren: () => import("./index/index.module").then((m) => m.IndexPageModule),
      },
      {
        path: "chat",
        loadChildren: () => import("./chat/chat.module").then((m) => m.ChatPageModule),
      },
      {
        path: "",
        redirectTo: "/chats/index",
        pathMatch: "full",
      },
    ],
  },
  {
    path: "",
    redirectTo: "/chats/index",
    pathMatch: "full",
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ChatsPageRoutingModule {}
