import { AddIcon } from "@chakra-ui/icons";
import { Box, Button, useToast, Stack, Text } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { ChatState, defaultUser } from "../context/chatProvider";
import {
  getLocalStorageUserInfo,
  setTokenFetch,
  getSender,
} from "../tools/index";
import { User } from "@constants/types";
import ChatLoading from "./ChatLoading";
import GroupChatModal from "./Miscellaneous/GroupChatModal";
import { getErrorRequestOptions } from "./Toasts";

interface Props {
  fetchAgain: boolean;
}

const MyChats = ({ fetchAgain }: Props) => {
  const [loggedUser, setLoggedUser] = useState<User>(defaultUser);
  const { selectedChat, setSelectedChat, user, chats, setChats } = ChatState();
  const toast = useToast();

  useEffect(() => {
    setLoggedUser(getLocalStorageUserInfo());
  }, [fetchAgain]);

  useEffect(() => {
    if (user._id) fetchChats();
  }, [user, fetchAgain]);

  const fetchChats = async () => {
    try {
      const { data } = await setTokenFetch(user.token).get("/api/chat");
      setChats!(data);
    } catch (error) {
      toast(getErrorRequestOptions("获取会话列表失败"));
    }
  };
  return (
    <Box
      display={{ base: selectedChat._id ? "none" : "flex", md: "flex" }}
      flexDir="column"
      alignItems="center"
      p={3}
      bg="white"
      w={{ base: "100%", md: "31%" }}
      borderRadius="lg"
      borderWidth="1px"
    >
      <Box
        pb={3}
        px={3}
        fontSize={{ base: "28px", md: "20px" }}
        fontFamily="Work sans"
        display="flex"
        w="100%"
        justifyContent="space-between"
        alignItems="center"
      >
        我的会话
        <GroupChatModal>
          <Button
            display="flex"
            fontSize={{ base: "17px", md: "10px", lg: "17px" }}
            rightIcon={<AddIcon />}
          >
            添加会话
          </Button>
        </GroupChatModal>
      </Box>

      <Box
        display="flex"
        flexDir="column"
        p={3}
        bg="#F8F8F8"
        w="100%"
        h="100%"
        borderRadius="lg"
        overflowY="hidden"
      >
        {chats ? (
          <Stack overflowY="scroll">
            {chats.map((chat) => (
              <Box
                onClick={() => setSelectedChat!(chat)}
                cursor="pointer"
                bg={selectedChat === chat ? "#38B2AC" : "#E8E8E8"}
                color={selectedChat === chat ? "white" : "black"}
                px={3}
                py={2}
                borderRadius="lg"
                key={chat._id}
              >
                <Text>
                  {!chat.isGroupChat
                    ? getSender(loggedUser, chat.users)
                    : chat.chatName}
                </Text>
                {chat.latestMessage && (
                  <Text fontSize="xs">
                    <b>{chat.latestMessage.sender.name} : </b>
                    {chat.latestMessage.content.length > 50
                      ? chat.latestMessage.content.substring(0, 51) + "..."
                      : chat.latestMessage.content}
                  </Text>
                )}
              </Box>
            ))}
          </Stack>
        ) : (
          <ChatLoading />
        )}
      </Box>
    </Box>
  );
};

export default MyChats;
