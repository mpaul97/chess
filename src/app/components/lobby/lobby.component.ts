import { Component, OnInit } from '@angular/core';
import { ChessService } from 'src/app/services/chess.service';
import { PlayerCountPipe } from 'src/app/util/player-count.pipe';

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

  constructor(private cs: ChessService) { }

  ngOnInit(): void {
    this.cs.getRooms()

    this.cs.newRoomAdded.subscribe((newRooms) => {
      for(let room of newRooms) {
        this.rooms.push(room)
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
}
