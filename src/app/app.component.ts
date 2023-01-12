import { Component, OnInit } from '@angular/core';
import { ChessService } from './services/chess.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'chess';
  rooms = new Set()

  constructor(private cs: ChessService) { }

  ngOnInit(): void {
    
  }
}
