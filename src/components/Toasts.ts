import { UseToastOptions } from "@chakra-ui/react";

export const getErrorRequestOptions = (
  errorMsg: string,
  config?: Partial<UseToastOptions>
): UseToastOptions => ({
  title: errorMsg,
  status: "error",
  duration: 5000,
  isClosable: true,
  position: "bottom",
  ...config,
});
