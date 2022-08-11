import {ChatState} from './chat.model';
import * as ChatActions from './chat.actions';

const initialState = {
  conversations: {},
  meta: {groups: {}, users: {}},
  stats: {}
};


export function chatReducer(state: ChatState = initialState, action: ChatActions.AllChatActions): ChatState {
  switch (action.type) {
    case ChatActions.REPLACE_CHATS:
      return {...state, conversations: {[action.room]: action.conv}};
    case ChatActions.UPDATE_CHATS:
      const objMap = {};
      action.conv.forEach(item => {
        objMap[item.messageId] = item;
      });
      return {...state, conversations: {...state.conversations, [action.room]: {...state.conversations[action.room], ...objMap}}};
    case ChatActions.ADD_CHAT_MESSAGE:
      return {...state,
        conversations: {
          ...state.conversations,
          [action.group]: {...state.conversations[action.group], [action.message.messageId]: action.message}
        }
      };
    case ChatActions.REPLACE_META:
      return {...state, meta: action.meta};
    case ChatActions.CHAT_STATS_REPLACE:
      return {...state, stats: action.stats};
    case ChatActions.MARK_ROOM_AS_VIEWED_SUCCESS:
      return {...state, stats: {...state.stats, [action.room]: 0}};
    case ChatActions.CLEAR_ALL_CHATS:
      return {...state, conversations: {}};
    default:
      return state;
  }
}
