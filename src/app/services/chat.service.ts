import { EventEmitter, Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  recieveMessage: EventEmitter<any> = new EventEmitter()
  recieveMessages: EventEmitter<any[]> = new EventEmitter()

  constructor(private socket: Socket) {
    socket.on('recieveMessage', (message: any) => {
      this.recieveMessage.emit(message)
    })
    socket.on('recieveMessages', (messages: any[]) => {
      this.recieveMessages.emit(messages)
    })
  }

  sendMessage(message: string, username: string, room: string | null) {
    if(room) {
      this.socket.emit('sendMessageToRoom', {
        room: room,
        message: message,
        username: username,
        timestamp: new Date(Date.now()).toLocaleTimeString()
      })
      return
    }
    this.socket.emit('sendMessage', {
      message: message,
      username: username,
      timestamp: new Date(Date.now()).toLocaleTimeString()
    })
  }
  getMessages() {
    this.socket.emit('getMessages', (messages: any[]) => {
      this.recieveMessages.emit(messages)
    })
  }
}
