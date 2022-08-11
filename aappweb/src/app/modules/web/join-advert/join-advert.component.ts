import { Component, OnInit, ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-join-advert',
  templateUrl: './join-advert.component.html',
  styleUrls: ['./join-advert.component.scss']
})
export class JoinAdvertComponent implements OnInit {

  constructor(private changeDet:ChangeDetectorRef) { }

  ngOnInit() {
  
  }

}
