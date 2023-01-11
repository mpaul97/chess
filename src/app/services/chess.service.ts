import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';

@Injectable({
  providedIn: 'root'
})
export class ChessService {

  constructor(private socket: Socket) { }

  connect() {
    this.socket.connect() 
  }

  emitMessage() {
    console.log('emitting')
    this.socket.emit('message', 'HELLOWORLD!')
  }
}
