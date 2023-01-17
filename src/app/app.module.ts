import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BoardComponent } from './components/board/board.component';
import { PieceComponent } from './components/piece/piece.component';

import { SocketIoModule, SocketIoConfig } from 'ngx-socket-io';
import { LobbyComponent } from './components/lobby/lobby.component';

import {TableModule} from 'primeng/table';
import {ButtonModule} from 'primeng/button';
import {DialogModule} from 'primeng/dialog';
import {InputTextModule} from 'primeng/inputtext';
import { PrimeIcons } from 'primeng/api';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { PlayerCountPipe } from './util/player-count.pipe';

const config: SocketIoConfig = { url: 'http://localhost:3000', options: { withCredentials: false,} };

@NgModule({
  declarations: [
    AppComponent,
    BoardComponent,
    PieceComponent,
    LobbyComponent,
    PlayerCountPipe
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    SocketIoModule.forRoot(config),
    TableModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    FormsModule,
    BrowserAnimationsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
