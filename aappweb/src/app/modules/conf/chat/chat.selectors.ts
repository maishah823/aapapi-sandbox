import {createFeatureSelector, createSelector} from '@ngrx/store';
import {ChatState} from './chat.model';
import {ChatMessage} from '@shared/classes';
import {getUserId} from '@shared/state/user/user.reducer';

export const getChat = createFeatureSelector<ChatState>('chat');
export const getConversations = createSelector(getChat, (chat: ChatState) => chat.conversations);
export const getConversationsSortedArrays = createSelector(getConversations, (convs: any) => {
  const obj = {};
  Object.keys(convs).forEach(key => {
    obj[key] = Object.keys(convs[key]).map(id => convs[key][id])
      .sort((a, b) => new Date(a.date).getTime() > new Date(b.date).getTime() ? 1 : -1);
  });
  return obj;
});
export const getRoom = (room) => createSelector(getConversations, (convos) => convos[room]);
export const arrayOfMessagesInConvo = (room: string = 'none') => {
  return createSelector(getRoom(room),
    msgs => {
      return Object.keys(msgs || {}).map(id => msgs[id]).sort(
        (a: ChatMessage, b: ChatMessage) => {
          return a.date > b.date ? 1 : -1;
        }
      );
    }
  );
};
export const numberOfMessagesInConvo = (room: string = 'none') => {
  return createSelector(getRoom(room),
    convos => {
      return Object.keys(convos || {}).length;
    }
  );
};
export const getChatMeta = createSelector(getChat, (chat: ChatState) => chat.meta);
export const getFilteredMeta = createSelector(getChatMeta, getUserId, (meta: any, userId: string) => {
  delete meta.users[userId];
  return meta;
});
export const getChatUsers = createSelector(getChatMeta, (chatMeta: any) => chatMeta.users);
export const getOtherChatUsers = createSelector(getChatUsers, getUserId, (users: any, userId: string) => {
  delete users[userId];
  return users;
});
export const getChatGroups = createSelector(getChatMeta, (chatMeta: any) => chatMeta.groups);

export const getStats = createSelector(getChat, (chat: ChatState) => chat.stats);
