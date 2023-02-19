import axios, { Axios } from "axios";

export const setTokenFetch = (token: string) => {
  return axios.create({
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};
