import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.css']
})
export class BoardComponent implements OnInit {

  files: string[] = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
  ranks: number[] = [8, 7, 6, 5, 4, 3, 2, 1];

  type: string = "";

  constructor() {

  }

  ngOnInit(): void {
  }

}
