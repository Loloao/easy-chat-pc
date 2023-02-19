import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ChakraProvider, extendTheme } from "@chakra-ui/react";
import ChatProviderWrapper from "./context/chatProvider";

import App from "./App";

const colors = {
  brand: {
    900: "#1a365d",
    800: "#153e75",
    700: "#2a69ac",
  },
};

const theme = extendTheme({ colors });

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <BrowserRouter>
    <ChatProviderWrapper>
      <ChakraProvider theme={theme}>
        <App />
      </ChakraProvider>
    </ChatProviderWrapper>
  </BrowserRouter>
);
