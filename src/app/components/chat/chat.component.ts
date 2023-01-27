import { Component, OnInit } from '@angular/core';
import { ChatService } from 'src/app/services/chat.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit {

  inputMessage: string = ""
  messages: any[] = []
  username: string = ""
  displayDialog: boolean = false

  constructor(private cs: ChatService) { 
    this.cs.recieveMessage.subscribe((message) => {
      this.messages.push(message)
    })
    this.cs.recieveMessages.subscribe((messages) => {
      this.messages.push(...messages)
    })
  }

  ngOnInit(): void { 
    this.displayDialog = true
    this.cs.getMessages()
  }

  joinChat() {
    this.displayDialog = false
  }

  sendMessage() {
    this.cs.sendMessage(this.inputMessage, this.username)
    this.inputMessage = ""
  }
}
