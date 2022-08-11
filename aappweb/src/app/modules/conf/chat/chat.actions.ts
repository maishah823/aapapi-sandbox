import {Action} from '@ngrx/store';
import {ChatMessage} from '@shared/classes/ChatMessage';

export const GET_CONVERSATION = '[chats]GET_CONVERSATION';
export const GET_MORE_CONVERSATION = '[chats]GET_MORE_CONVERSATION';
export const REPLACE_CHATS = '[chats]REPLACE_CHATS';
export const UPDATE_CHATS = '[chats]UPDATE_CHATS';
export const ADD_CHAT_MESSAGE = '[chats]ADD_CHAT_MESSAGE';
export const REMOVE_CHAT_MESSAGE = '[chats]REMOVE_CHAT_MESSAGE';
export const CLEAR_ALL_CHATS = '[chats]CLEAR_ALL_CHATS';
export const REPLACE_META = '[chats]REPLACE_META';
export const CHAT_STATS_REPLACE = '[chats]CHAT_STATS_REPLACE';
export const GET_STATS = '[chats]GET_STATS';
export const MARK_ROOM_AS_VIEWED = '[chat]MARK_ROOM_AS_VIEWED';
export const MARK_ROOM_AS_VIEWED_SUCCESS = '[chat]MARK_ROOM_AS_VIEWED_SUCCESS';

export class GetConversationAction implements Action {
  readonly type = GET_CONVERSATION;

  constructor(public room: string) {
  }
}

export class GetMoreConversationAction implements Action {
  readonly type = GET_MORE_CONVERSATION;

  constructor(public room: string) {
  }
}

export class ClearAllChatAction implements Action {
  readonly type = CLEAR_ALL_CHATS;

  constructor() {
  }
}

export class ReplaceChatsAction implements Action {
  readonly type = REPLACE_CHATS;

  constructor(public room: string, public conv: ChatMessage[]) {
  }
}

export class UpdateChatsAction implements Action {
  readonly type = UPDATE_CHATS;

  constructor(public room: string, public conv: ChatMessage[]) {
  }
}

export class AddChatMessageAction implements Action {
  readonly type = ADD_CHAT_MESSAGE;

  constructor(public group: string, public message: ChatMessage) {
  }
}

export class ReplaceMetaAction implements Action {
  readonly type = REPLACE_META;

  constructor(public meta: Object) {
  }
}

export class GetStatsAction implements Action {
  readonly type = GET_STATS;

  constructor() {
  }
}

export class ChatStatsReplaceAction implements Action {
  readonly type = CHAT_STATS_REPLACE;

  constructor(public stats: Object) {
  }
}

export class MarkRoomAsViewedAction implements Action {
  readonly type = MARK_ROOM_AS_VIEWED;

  constructor(public room: string) {
  }
}

export class MarkRoomAsViewedSuccessAction implements Action {
  readonly type = MARK_ROOM_AS_VIEWED_SUCCESS;

  constructor(public room: string) {
  }
}

export type AllChatActions = ReplaceChatsAction |
  UpdateChatsAction |
  ReplaceMetaAction |
  AddChatMessageAction |
  GetConversationAction |
  GetMoreConversationAction |
  ChatStatsReplaceAction |
  MarkRoomAsViewedAction |
  ClearAllChatAction |
  MarkRoomAsViewedSuccessAction;
