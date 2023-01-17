import { EventEmitter, Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';

@Injectable({
  providedIn: 'root'
})
export class ChessService {

  newRoomAdded: EventEmitter<any> = new EventEmitter()
  roomRefresh: EventEmitter<any> = new EventEmitter()
  displayBoard: EventEmitter<any> = new EventEmitter()

  constructor(private socket: Socket) { 
    socket.on('roomsList', (roomList: Array<any>) => {
      this.newRoomAdded.emit(roomList)
    })
    socket.on('displayBoard', () => {
      this.displayBoard.emit()
    })
  }

  connect() {
    this.socket.connect() 
  }

  getRooms() {
    this.socket.emit('getRooms', (res: any) => {
      this.roomRefresh.emit(res)
    })
  }
  newRoom(username: string) {
    this.socket.emit('newRoom', {username: username}, (res: any) => {
      console.log(res.message)
      this.newRoomAdded.emit(res.roomObject)
    })
  }
  joinRoom(room: string, username: string) {
    this.socket.emit('joinRoom', {room: room, username: username}, (res: any) => {
      console.log(res.message)
    })
  }
}
