import {Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy, SimpleChanges, OnDestroy} from '@angular/core';
import {UntypedFormBuilder, UntypedFormGroup} from '@angular/forms';
import {TdMediaService} from '@covalent/core/media';

@Component({
  selector: 'chat-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListComponent implements OnInit, OnDestroy {

  @Input() meta = {groups: {}, users: {}};
  @Input() online = [];
  @Input() stats: {};
  @Output() selected: EventEmitter<{}> = new EventEmitter<{}>();

  current: string;


  form: UntypedFormGroup;

  constructor(public media: TdMediaService, private fb: UntypedFormBuilder) {
  }

  ngOnInit() {
    this.form = this.fb.group({
      search: ''
    });
  }

  ngOnDestroy() {

  }

  groups() {
    return Object.keys(this.meta.groups);
  }

  users() {

    return Object.keys(this.meta.users).sort(
      (a, b) => {
        return this.meta.users[a] > this.meta.users[b] ? 1 : -1;
      }
    ).filter((key) => {
      if (!this.form.get('search').value) {
        return true;
      }
      let patt = new RegExp(this.form.get('search').value, 'i');
      return patt.test(this.meta.users[key]);

    });
  }

  isOnline(key) {
    if (this.online.indexOf(key) >= 0) {
      return true;
    }
    return false;
  }

  select(key, source) {
    this.selected.emit({id: key, name: this.meta[source][key]});
    this.current = key;
  }

  clearSearch(e) {
    e.stopPropagation();
    this.form.reset();
  }

}
