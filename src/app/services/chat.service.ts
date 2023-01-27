import { EventEmitter, Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  recieveMessage: EventEmitter<string> = new EventEmitter()

  constructor(private socket: Socket) {
    socket.on('recieveMessage', (message: any) => {
      this.recieveMessage.emit(message)
    })
  }

  sendMessage(message: string, username: string) {
    this.socket.emit('sendMessage', {
      message: message,
      username: username,
      timestamp: new Date(Date.now()).toLocaleTimeString()
    })
  }
}
