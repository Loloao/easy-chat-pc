import { User, Chat, Message } from "@constants/types";
import React from "react";

export interface ChatContextObj {
  user: User;
  setUser?: React.Dispatch<React.SetStateAction<User>>;
  selectedChat: Chat;
  setSelectedChat?: React.Dispatch<React.SetStateAction<Chat>>;
  chats: Chat[];
  setChats?: React.Dispatch<React.SetStateAction<Chat[]>>;
  notification: Message[];
  setNotification?: React.Dispatch<React.SetStateAction<Message[]>>;
}
