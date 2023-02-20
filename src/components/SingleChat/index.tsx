import { ArrowBackIcon, ArrowForwardIcon } from "@chakra-ui/icons";
import {
  Box,
  FormControl,
  IconButton,
  Input,
  Spinner,
  Text,
  Toast,
  useToast,
} from "@chakra-ui/react";
import React, {
  ChangeEvent,
  KeyboardEventHandler,
  useEffect,
  useState,
} from "react";
import io from "socket.io-client";
import { Socket } from "socket.io-client";
import axios from "axios";

import { ChatState } from "../../context/chatProvider";
import ProfileModal from "../Miscellaneous/ProfileModal";
import { defaultChat } from "../../context/chatProvider";
import { getSender, getSenderFull, setTokenFetch } from "../../tools";
import UpdateGroupChatModal from "../Miscellaneous/UpdateGroupChatModal";
import { Chat, Message } from "@constants/types";
import { SERVER_ADDRESS } from "@constants/index";
import { getErrorRequestOptions } from "../Toasts";
import ScrollableChat from "../ScrollableChat";
import { SOCKET_EVENT } from "@constants/enums";
import "./styles.css";

interface Props {
  fetchAgain: boolean;
  setFetchAgain: React.Dispatch<React.SetStateAction<boolean>>;
}

let socket: Socket, selectedChatCompare: Chat;

const SingleChat = ({ fetchAgain, setFetchAgain }: Props) => {
  const {
    CONNECTED,
    NEW_MESSAGE,
    CONNECTION,
    JOIN_CHAT,
    SET_UP,
    MESSAGE_RECEIVED,
  } = SOCKET_EVENT;
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [socketConnected, setSocketConnected] = useState(false);
  const [sendMessageLoading, setSendMessageLoading] = useState(false);

  const { user, selectedChat, setSelectedChat, notification, setNotification } =
    ChatState();
  const toast = useToast();

  useEffect(() => {
    socket = io(SERVER_ADDRESS);
    socket.emit(SET_UP, user);
    socket.on(CONNECTED, () => {
      console.log("client connected");
      setSocketConnected(true);
    });
  }, []);

  useEffect(() => {
    fetchMessages();

    selectedChatCompare = selectedChat;
  }, [selectedChat]);

  useEffect(() => {
    socket.on(MESSAGE_RECEIVED, (newMessageReceived: Message) => {
      if (
        !selectedChatCompare ||
        selectedChatCompare._id !== newMessageReceived.chat._id
      ) {
        if (!notification.includes(newMessageReceived)) {
          setNotification!([newMessageReceived, ...notification]);
          setFetchAgain(!fetchAgain);
        }
      } else {
        setMessages([...messages, newMessageReceived]);
      }
    });
  });

  const fetchMessages = async () => {
    if (!selectedChat._id) return;

    try {
      setLoading(true);
      const { data } = await setTokenFetch(user.token).get(
        `/api/message/${selectedChat._id}`
      );

      setMessages(data);
      socket.emit(JOIN_CHAT, selectedChat._id);
    } catch (error) {
      toast(getErrorRequestOptions("获取聊天记录失败!"));
    } finally {
      setLoading(false);
    }
  };

  const keydownSendMessage: KeyboardEventHandler<HTMLDivElement> = async (
    e
  ) => {
    if (e.key === "Enter") sendMessage();
  };

  const sendMessage = async () => {
    if (newMessage) {
      try {
        setNewMessage("");
        setSendMessageLoading(true);
        const { data } = await setTokenFetch(user.token).post("/api/message", {
          content: newMessage,
          chatId: selectedChat._id,
        });
        socket.emit(NEW_MESSAGE, data);
        setMessages([...messages, data]);
      } catch (error) {
        toast(getErrorRequestOptions("发送聊天信息失败!"));
      } finally {
        setSendMessageLoading(false);
      }
    }
  };

  const typingHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
  };

  return (
    <>
      {selectedChat._id ? (
        <>
          <Text
            fontSize={{ base: "28px", md: "30px" }}
            pb={3}
            px={2}
            w="100%"
            fontFamily="Work sans"
            display="flex"
            justifyContent={{ base: "space-between" }}
            alignItems="center"
          >
            <IconButton
              aria-label=""
              display={{ base: "flex", md: "none" }}
              icon={<ArrowBackIcon />}
              onClick={() => setSelectedChat!(defaultChat)}
            />
            {
              // messages &&
              !selectedChat.isGroupChat ? (
                <>
                  {getSender(user, selectedChat.users)}
                  <ProfileModal
                    user={getSenderFull(user, selectedChat.users)}
                  />
                </>
              ) : (
                <>
                  {selectedChat.chatName.toUpperCase()}
                  <UpdateGroupChatModal
                    fetchMessages={fetchMessages}
                    fetchAgain={fetchAgain}
                    setFetchAgain={setFetchAgain}
                  />
                </>
              )
            }
          </Text>
          <Box
            display="flex"
            flexDir="column"
            justifyContent="flex-end"
            p={3}
            bg="#E8E8E8"
            w="100%"
            h="100%"
            borderRadius="lg"
            overflowY="hidden"
          >
            {loading ? (
              <Spinner
                size="xl"
                w={20}
                h={20}
                alignSelf="center"
                margin="auto"
              />
            ) : (
              <div className="messages">
                <ScrollableChat messages={messages} />
              </div>
            )}

            <FormControl
              onKeyDown={keydownSendMessage}
              id="first-name"
              isRequired
              display="flex"
              justifyContent="space-between"
              mt={3}
            >
              {/* {istyping ? (
                <div>
                  <Lottie
                    options={defaultOptions}
                    // height={50}
                    width={70}
                    style={{ marginBottom: 15, marginLeft: 0 }}
                  />
                </div>
              ) : (
                <></>
              )} */}
              <Input
                variant="filled"
                bg="#E0E0E0"
                mr="2"
                placeholder="Enter a message.."
                value={newMessage}
                onChange={typingHandler}
              />
              <IconButton
                aria-label=""
                isLoading={sendMessageLoading}
                icon={<ArrowForwardIcon />}
                onClick={() => sendMessage()}
              />
            </FormControl>
          </Box>
        </>
      ) : (
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          h="100%"
        >
          <Text fontSize="3xl" pb={3} fontFamily="Work sans">
            点击用户进行聊天
          </Text>
        </Box>
      )}
    </>
  );
};

export default SingleChat;
