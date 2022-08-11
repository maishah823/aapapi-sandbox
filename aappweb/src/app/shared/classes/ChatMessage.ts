export const ChatMessageDirection = {
    Sent:'sent',
    Received:'received'
};

export class ChatMessage{
    messageId?:string;
    sentBy:string; //userId of sender.
    sentTo:string; //userId of receiver or room name
    senderName:string;
    date:Date;
    message:string;
    direction?:string; //set by server when saved in Redis.
    unread?:boolean; //set by server when saved in Redis.
}