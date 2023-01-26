import { EventEmitter, Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  recieveMessage: EventEmitter<string> = new EventEmitter()

  constructor(private socket: Socket) {
    socket.on('recieveMessage', (message: string) => {
      this.recieveMessage.emit(message)
    })
  }

  sendMessage(message: string) {
    this.socket.emit('sendMessage', message)
  }
}
