import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ReactiveFormsModule} from '@angular/forms';
import {chatReducer} from './chat.reducer';
import {StoreModule} from '@ngrx/store';
import {EffectsModule} from '@ngrx/effects';
import {ChatService} from './chat.service';
import {ChatEffects} from './chat.effects';
import {ChatComponent} from './chat.component';
import {RouterModule} from '@angular/router';
import {ListComponent} from './list.component';
import {MatListModule} from '@angular/material/list';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {CovalentLayoutModule} from '@covalent/core/layout';
@NgModule({
  imports: [
    ReactiveFormsModule,
    StoreModule.forFeature('chat', chatReducer),
    EffectsModule.forFeature([ChatEffects]),
    CommonModule,
    RouterModule,
    MatListModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    CovalentLayoutModule
  ],
  declarations: [ChatComponent, ListComponent],
  exports: [ChatComponent, ListComponent],
  providers: [ChatService]
})
export class ChatModule {
  constructor(chatService: ChatService) {
  }
}
