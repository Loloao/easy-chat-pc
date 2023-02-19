import React, { useState } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Button,
  IconButton,
  useToast,
  Box,
  FormControl,
  Input,
  Spinner,
} from "@chakra-ui/react";
import { ViewIcon } from "@chakra-ui/icons";
import { ChatState, defaultChat } from "../../context/chatProvider";
import { User } from "@constants/types";
import UserBadgeItem from "../UserAvatar/UserBadgeItem";
import { debounce, setTokenFetch } from "../../tools";
import UserListItem from "../UserAvatar/UserListItem";
import { getErrorRequestOptions } from "../Toasts";

interface Props {
  fetchAgain: boolean;
  setFetchAgain: React.Dispatch<React.SetStateAction<boolean>>;
  fetchMessages: () => void;
}

const UpdateGroupChatModal = ({
  fetchAgain,
  setFetchAgain,
  fetchMessages,
}: Props) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [groupChatName, setGroupChatName] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [searchRes, setSearchRes] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [renameLoading, setRenameLoading] = useState(false);

  const toast = useToast();

  const { selectedChat, setSelectedChat, user } = ChatState();

  const handleRemove = async (removeUser: User) => {
    if (
      selectedChat.groupAdmin?._id !== user._id &&
      removeUser._id !== user._id
    ) {
      toast({
        title: "只有管理员才能添加用户",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      return;
    }

    try {
      setLoading(true);
      const { data } = await setTokenFetch(user.token).put(
        "/api/chat/groupremove",
        {
          chatId: selectedChat._id,
          userId: removeUser._id,
        }
      );

      removeUser._id === user._id
        ? setSelectedChat!(defaultChat)
        : setSelectedChat!(data);
      setFetchAgain(!fetchAgain);
    } catch (error) {
      toast(getErrorRequestOptions("聊天组删除用户失败"));
    } finally {
      setLoading(false);
    }

    setGroupChatName("");
  };
  const handleRename = async () => {
    if (!groupChatName) return;
    try {
      setRenameLoading(true);
      const { data } = await setTokenFetch(user.token).put("/api/chat/rename", {
        chatId: selectedChat._id,
        chatName: groupChatName,
      });

      setSelectedChat!(data);
      setFetchAgain(!fetchAgain);
    } catch (error) {
      toast(getErrorRequestOptions("修改组名错误!"));
    } finally {
      setRenameLoading(false);
    }

    setGroupChatName("");
  };
  const handleSearch = debounce(async (queryStr: string) => {
    setSearch(queryStr);
    if (!queryStr) return;
    try {
      setLoading(true);

      const { data } = await setTokenFetch(user.token).get(
        `/api/user?search=${queryStr}`
      );

      setLoading(false);
      fetchMessages();
      setSearchRes(data);
    } catch (error) {
      toast(getErrorRequestOptions("搜索用户失败!"));
    }
  });

  const handleAddUser = async (userToAdd: User) => {
    if (selectedChat.users.find((v) => v._id === userToAdd._id)) {
      toast({
        title: "已添加用户",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      return;
    }

    if (selectedChat.groupAdmin?._id !== user._id) {
      toast({
        title: "只有管理员才能添加用户",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      return;
    }

    try {
      const { data } = await setTokenFetch(user.token).put(
        "/api/chat/groupadd",
        {
          chatId: selectedChat._id,
          userId: userToAdd._id,
        }
      );

      setSelectedChat!(data);
      setFetchAgain(!fetchAgain);
    } catch (error) {
      toast(getErrorRequestOptions("添加用户失败!"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <IconButton
        aria-label=""
        display={{ base: "flex" }}
        icon={<ViewIcon />}
        onClick={onOpen}
      />

      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{selectedChat.chatName}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Box w="100%" display="flex" flexWrap="wrap" pb={3}>
              {selectedChat.users.map((v) => (
                <UserBadgeItem
                  key={v._id}
                  user={v}
                  handleFunction={() => handleRemove(v)}
                />
              ))}
            </Box>
            <FormControl display="flex">
              <Input
                placeholder="聊天名"
                mb={3}
                value={groupChatName}
                onChange={(e) => setGroupChatName(e.target.value)}
              />
              <Button
                variant="solid"
                colorScheme="teal"
                ml={1}
                isLoading={renameLoading}
                onClick={handleRename}
              >
                更新
              </Button>
            </FormControl>
            <FormControl>
              <Input
                placeholder="添加用户进聊天组"
                mb={1}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </FormControl>
            {loading ? (
              <Spinner size="lg" />
            ) : (
              searchRes?.map((v) => (
                <UserListItem
                  key={v._id}
                  user={v}
                  handleFunction={() => handleAddUser(v)}
                />
              ))
            )}
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="red" mr={3} onClick={() => handleRemove(user)}>
              离开
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default UpdateGroupChatModal;
