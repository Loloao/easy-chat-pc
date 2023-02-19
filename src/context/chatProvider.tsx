import {
  createContext,
  Provider,
  useContext,
  useEffect,
  useState,
} from "react";
import { useHistory } from "react-router-dom";
import { ChatContextObj } from "./types";
import { User, Chat, Message } from "@constants/types";
import { getLocalStorageUserInfo } from "../tools";

export const defaultUser: User = {
  _id: "",
  name: "",
  pic: "",
  email: "",
  token: "",
};
export const defaultChat: Chat = {
  _id: "",
  chatName: "",
  users: [],
  isGroupChat: false,
};

const ChatContext = createContext<ChatContextObj>({
  user: defaultUser,
  selectedChat: defaultChat,
  chats: [],
  notification: [],
});
const { Provider: ChatProvider } = ChatContext;

interface Props {
  children?: React.ReactNode;
}

const ChatProviderWrapper = ({ children }: Props) => {
  const [user, setUser] = useState(defaultUser);
  const [selectedChat, setSelectedChat] = useState(defaultChat);
  const [chats, setChats] = useState<Chat[]>([]);
  const [notification, setNotification] = useState<Message[]>([]);

  const history = useHistory();

  useEffect(() => {
    const userInfo = getLocalStorageUserInfo();
    setUser(userInfo);

    if (!userInfo) {
      history.push("/");
    }
  }, [history]);

  return (
    <ChatProvider
      value={{
        user,
        setUser,
        selectedChat,
        setSelectedChat,
        chats,
        setChats,
        notification,
        setNotification,
      }}
    >
      {children}
    </ChatProvider>
  );
};

export const ChatState = () => {
  return useContext(ChatContext);
};

export default ChatProviderWrapper;
