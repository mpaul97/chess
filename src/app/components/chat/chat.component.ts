import { Component, OnInit } from '@angular/core';
import { ChatService } from 'src/app/services/chat.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit {

  inputMessage: string = ""
  messages: string[] = []

  constructor(private cs: ChatService) { 
    this.cs.recieveMessage.subscribe((message) => {
      this.messages.push(message)
    })
  }

  ngOnInit(): void { 

  }

  sendMessage() {
    this.cs.sendMessage(this.inputMessage)
    this.inputMessage = ""
  }

}
