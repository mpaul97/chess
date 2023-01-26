import { Component, OnInit } from '@angular/core';
import { ChessService } from 'src/app/services/chess.service';

@Component({
  selector: 'app-nav-bar',
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.css']
})
export class NavBarComponent implements OnInit {

  totalUsers: number = 0

  constructor(private cs: ChessService) { 
    this.cs.totalUsers.subscribe((totalUsers) => {
      this.totalUsers = totalUsers
    })
  }

  ngOnInit(): void {

  }

}
