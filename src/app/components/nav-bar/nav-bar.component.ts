import { Component, OnInit } from '@angular/core';
import { MenuItem } from 'primeng/api/menuitem';
import { ChessService } from 'src/app/services/chess.service';

@Component({
  selector: 'app-nav-bar',
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.css']
})
export class NavBarComponent implements OnInit {

  totalUsers: number = 0
  items: MenuItem[] = [
    {
      label: 'Play',
      icon: 'pi pi-play',
      routerLink: ['']
    },
    {
      label: 'Chat',
      icon: 'pi pi-comments',
      routerLink: ['/chat']
    }
  ]

  constructor(private cs: ChessService) { 
    this.cs.totalUsers.subscribe((totalUsers) => {
      this.totalUsers = totalUsers
    })
  }

  ngOnInit(): void {

  }


}
