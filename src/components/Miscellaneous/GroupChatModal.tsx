import {
  useDisclosure,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useToast,
  FormControl,
  Input,
  Box,
} from "@chakra-ui/react";
import React, { useState } from "react";
import { ChatState } from "../../context/chatProvider";
import { setTokenFetch, debounce } from "../../tools";
import { User } from "@constants/types";
import UserBadgeItem from "../UserAvatar/UserBadgeItem";
import UserListItem from "../UserAvatar/UserListItem";
import { getErrorRequestOptions } from "../Toasts";

interface Props {
  children: React.ReactNode;
}

const GroupChatModal = ({ children }: Props) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [groupChatName, setGroupChatName] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [searchRes, setSearchRes] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  const toast = useToast();
  const { user, chats, setChats } = ChatState();

  const handleSearch = debounce(async (queryStr: string) => {
    setSearch(queryStr);
    if (!queryStr) return;
    try {
      setLoading(true);

      const { data } = await setTokenFetch(user.token).get(
        `/api/user?search=${queryStr}`
      );

      setSearchRes(data);
    } catch (error) {
      toast(getErrorRequestOptions("搜索用户失败!"));
    } finally {
      setLoading(false);
    }
  });

  const handleGroup = (userToAdd: User) => {
    if (selectedUsers.includes(userToAdd)) {
      toast({
        title: "已添加用户",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
      return;
    }

    setSelectedUsers([...selectedUsers, userToAdd]);
  };

  const handleDelete = (delUser: User) => {
    setSelectedUsers(selectedUsers.filter((v) => v._id !== delUser._id));
  };
  const handleSubmit = async () => {
    if (!groupChatName || !selectedUsers.length) {
      toast({
        title: "请完成表单",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
      return;
    }

    try {
      const { data } = await setTokenFetch(user.token).post("/api/chat/group", {
        name: groupChatName,
        users: JSON.stringify(selectedUsers.map((v) => v._id)),
      });

      setChats!([data, ...chats]);
      onClose();
      toast({
        title: "创建聊天组成功",
        status: "success",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
    } catch (error) {
      toast(getErrorRequestOptions("创建会话失败!"));
    }
  };

  return (
    <>
      <span onClick={onOpen}>{children}</span>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader
            fontSize="35px"
            fontFamily="Work sans"
            display="flex"
            justifyContent="center"
          >
            创建聊天组
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody display="flex" flexDir="column" alignItems="center">
            <FormControl>
              <Input
                placeholder="聊天名"
                mb={3}
                onChange={(e) => setGroupChatName(e.target.value)}
              />
            </FormControl>
            <FormControl>
              <Input
                placeholder="添加用户"
                mb={1}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </FormControl>
            <Box w="100%" display="flex" flexWrap="wrap">
              {selectedUsers.map((v) => (
                <UserBadgeItem
                  key={v._id}
                  user={v}
                  handleFunction={() => handleDelete(v)}
                />
              ))}
            </Box>
            {loading ? (
              <div>loading</div>
            ) : (
              searchRes
                ?.slice(0, 4)
                .map((v) => (
                  <UserListItem
                    key={v._id}
                    handleFunction={() => handleGroup(v)}
                    user={v}
                  />
                ))
            )}
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="blue" onClick={handleSubmit}>
              创建聊天
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default GroupChatModal;
