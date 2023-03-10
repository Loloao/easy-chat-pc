import { Box } from "@chakra-ui/react";
import React from "react";
import { ChatState } from "../context/chatProvider";
import SingleChat from "./SingleChat";

interface Props {
  fetchAgain: boolean;
  setFetchAgain: React.Dispatch<React.SetStateAction<boolean>>;
}

const ChatBox = ({ fetchAgain, setFetchAgain }: Props) => {
  const { selectedChat } = ChatState();
  return (
    <Box
      display={{ base: selectedChat._id ? "flex" : "none", md: "flex" }}
      alignItems="center"
      flexDir="column"
      p={3}
      bg="white"
      w={{ base: "100%", md: "68%" }}
      borderRadius="lg"
      borderWidth="1px"
    >
      <SingleChat fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} />
    </Box>
  );
};

export default ChatBox;
