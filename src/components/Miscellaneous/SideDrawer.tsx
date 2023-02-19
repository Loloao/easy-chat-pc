import {
  Box,
  Tooltip,
  Button,
  Text,
  Menu,
  MenuButton,
  Avatar,
  MenuList,
  MenuItem,
  Drawer,
  useDisclosure,
  DrawerOverlay,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  Input,
  Toast,
  useToast,
  Spinner,
} from "@chakra-ui/react";
import { BellIcon, ChevronDownIcon } from "@chakra-ui/icons";
import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import axios from "axios";

import { ChatState } from "../../context/chatProvider";
import ProfileModal from "./ProfileModal";
import ChatLoading from "../ChatLoading";
import { User } from "@constants/types";
import UserListItem from "../UserAvatar/UserListItem";
import { getErrorRequestOptions } from "../Toasts";
import { getSender, setTokenFetch } from "../../tools";
import NotificationBadge, { Effect } from "react-notification-badge";

const SideDrawer = () => {
  const [search, setSearch] = useState("");
  const [searchRes, setSearchRes] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingChat, setLoadingChat] = useState(false);
  const history = useHistory();
  const toast = useToast();

  const {
    user,
    setSelectedChat,
    chats,
    setChats,
    notification,
    setNotification,
  } = ChatState();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const logoutHandler = () => {
    localStorage.removeItem("userInfo");
    history.push("/");
  };

  const handleSearch = async () => {
    if (!search) {
      toast({
        title: "请输入搜索内容",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "top-left",
      });
      return;
    }

    try {
      setLoading(true);
      const { data } = await setTokenFetch(user.token).get(
        `/api/user?search=${search}`
      );

      setSearchRes(data);
    } catch (error) {
      toast(getErrorRequestOptions("搜索用户失败!"));
    } finally {
      setLoading(false);
    }
  };

  const accessChat = async (userId: string) => {
    try {
      setLoadingChat(true);
      const config = {
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.post("/api/chat", { userId }, config);

      if (!chats.find((v) => v._id === data._id)) setChats!([data, ...chats]);
      setSelectedChat!(data);
      onClose();
    } catch (error) {
      toast(getErrorRequestOptions("获取会话失败!"));
    } finally {
      setLoading(false);
    }
  };
  return (
    <>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        bg="white"
        w="100%"
        p="5px 10px 5px 10px"
        borderWidth="5px"
      >
        <Tooltip label="搜索用户进行会话" hasArrow placement="bottom-end">
          <Button variant="ghost" onClick={onOpen}>
            <i className="fas fa-search"></i>
            <Text display={{ base: "none", md: "flex" }} px="4">
              搜索用户
            </Text>
          </Button>
        </Tooltip>

        <Text fontSize="2xl">Easy-Chat</Text>

        <div>
          <Menu>
            <MenuButton p={1}>
              <NotificationBadge
                count={notification.length}
                effect={Effect.SCALE}
              />
              <BellIcon fontSize="2xl" m={1} />
            </MenuButton>
            <MenuList pl={2}>
              {!notification && "没有新的消息"}
              {notification.map((v) => {
                return (
                  <MenuItem
                    key={v._id}
                    onClick={() => {
                      setSelectedChat!(v.chat);
                      setNotification!(notification.filter((v1) => v1 === v));
                    }}
                  >
                    {v.chat.isGroupChat
                      ? `来自${v.chat.chatName}的消息`
                      : `来自${getSender(user, v.chat.users)}的消息`}
                  </MenuItem>
                );
              })}
            </MenuList>
          </Menu>
          <Menu>
            <MenuButton as={Button} rightIcon={<ChevronDownIcon />}>
              <Avatar
                size="sm"
                cursor="pointer"
                name={user.name}
                src={user.pic}
              />
            </MenuButton>
            <MenuList>
              <ProfileModal user={user}>
                <MenuItem>我的信息</MenuItem>
              </ProfileModal>
              <MenuItem onClick={logoutHandler}>注销</MenuItem>
            </MenuList>
          </Menu>
        </div>
      </Box>

      <Drawer placement="left" onClose={onClose} isOpen={isOpen}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerHeader borderBottomWidth="1px">搜索用户</DrawerHeader>
          <DrawerBody>
            <Box display="flex" pb={2}>
              <Input
                placeholder="搜索名称或email"
                mr={2}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <Button onClick={handleSearch}>
                <i className="fas fa-search"></i>
              </Button>
            </Box>
            {loading ? (
              <ChatLoading />
            ) : (
              searchRes.map((user) => (
                <UserListItem
                  key={user._id}
                  user={user}
                  handleFunction={() => accessChat(user._id)}
                />
              ))
            )}
            {loadingChat && <Spinner ml="auto" display="flex" />}
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default SideDrawer;
