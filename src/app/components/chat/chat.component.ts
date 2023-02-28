import { Component, Input, OnInit } from '@angular/core';
import { ChatService } from 'src/app/services/chat.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit {

  inputMessage: string = ""
  messages: any[] = []
  displayDialog: boolean = false

  @Input() room: string | null = null
  @Input() username: string = ""
  @Input() shouldDisplayTimestamps: boolean = true

  constructor(private cs: ChatService) { 
    this.cs.recieveMessage.subscribe((message) => {
      if(this.room && !message.room) {
        return
      }

      this.messages.push(message)
    })
    this.cs.recieveMessages.subscribe((messages) => {
      this.messages.push(...messages)
    })
  }

  ngOnInit(): void { 
    if(this.room) { return }
    this.displayDialog = true
    this.cs.getMessages()
  }

  joinChat() {
    this.displayDialog = false
  }

  sendMessage() {
    this.cs.sendMessage(this.inputMessage, this.username, this.room)
    this.inputMessage = ""
  }
}
