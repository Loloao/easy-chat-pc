import React, { useEffect, useState } from "react";
import axios from "axios";

import { ChatState } from "../../context/chatProvider";
import { Box } from "@chakra-ui/react";
import SideDrawer from "../../components/Miscellaneous/SideDrawer";
import ChatBox from "../../components/ChatBox";
import MyChats from "../../components/MyChats";

export default function ChatPage() {
  const { user } = ChatState();
  const [fetchAgain, setFetchAgain] = useState(false);

  return (
    <div
      style={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        maxHeight: "100vh",
      }}
    >
      {user && <SideDrawer />}
      <Box
        flex={1}
        display="flex"
        justifyContent="space-between"
        w="100%"
        p="10px"
        overflow="scroll"
      >
        {user && <MyChats fetchAgain={fetchAgain} />}
        {user && (
          <ChatBox fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} />
        )}
      </Box>
    </div>
  );
}
