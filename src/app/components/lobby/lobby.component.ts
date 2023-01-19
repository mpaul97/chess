import { Component, OnInit } from '@angular/core';
import { ChessService } from 'src/app/services/chess.service';

@Component({
  selector: 'app-lobby',
  templateUrl: './lobby.component.html',
  styleUrls: ['./lobby.component.css']
})
export class LobbyComponent implements OnInit {

  rooms = new Array()
  selectedRoom: string = ""
  displayDialog: boolean = false
  displayJoinDialog: boolean = false
  username: string = ""
  displayBoard: boolean = false
  userInfo: any = {}
  gameInfo: any = {}

  constructor(private cs: ChessService) { }

  ngOnInit(): void {
    this.cs.newRoomAdded.subscribe((newRooms) => {
      for(let room of newRooms) {
        this.rooms.push(room)
      }
    })
    this.cs.roomRefresh.subscribe((rooms) => {
      this.rooms = []
      for(let room of rooms) {
        this.rooms.push(room)
      }
    })
    this.cs.displayBoard.subscribe((res) => {
      this.displayBoard = true

      if(res.playerOne.username === this.username) {
        this.userInfo = res.playerOne
        this.gameInfo = {room: res.room, turn: res.turn}
        console.log(`You are playing as ${this.userInfo.color}`)
      }
      else {
        this.userInfo = res.playerTwo
        this.gameInfo = {room: res.room, turn: res.turn}
        console.log(`You are playing as ${this.userInfo.color}`)
      }
    })
  }

  onNewRoom() {
    this.cs.newRoom(this.username)
    this.displayDialog = false
  }
  onJoinRoom(room: any) {
    this.displayJoinDialog = true
    this.selectedRoom = room.room
  }
  joinRoom(room: string) {
    this.cs.joinRoom(room, this.username)
    this.displayJoinDialog = false
  }
  refreshRooms() {
    this.cs.getRooms()
  }
}
