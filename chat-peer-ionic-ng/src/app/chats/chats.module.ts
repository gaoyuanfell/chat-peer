import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";

import { IonicModule } from "@ionic/angular";

import { ChatsPageRoutingModule } from "./chats-routing.module";

import { ChatsPage } from "./chats.page";
import { VideoComponent } from "./video/video.component";

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, ChatsPageRoutingModule],
  declarations: [ChatsPage, VideoComponent],
})
export class ChatsPageModule {}
