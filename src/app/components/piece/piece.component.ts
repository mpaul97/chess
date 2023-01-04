import { Component, Input, OnInit } from '@angular/core';
import { Info } from 'src/models/info';

@Component({
  selector: 'app-piece',
  templateUrl: './piece.component.html',
  styleUrls: ['./piece.component.css']
})
export class PieceComponent implements OnInit {

  @Input() info: Info = new Info();

  constructor() { }

  ngOnInit(): void {
  }

}
