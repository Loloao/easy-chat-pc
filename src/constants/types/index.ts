export interface User {
  _id: string;
  name: string;
  pic: string;
  email: string;
  token: string;
}

export interface Message {
  _id: string;
  sender: User;
  content: string;
  chat: Chat;
}

export interface Chat {
  isGroupChat: boolean;
  users: User[];
  _id: string;
  chatName: string;
  groupAdmin?: User;
  latestMessage?: Message;
}
