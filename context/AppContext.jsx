'use client';

import { useAuth, useUser } from "@clerk/nextjs";
import axios from "axios";
import { createContext, useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";

export const AppContext = createContext();

export const useAppContext = () => {
  return useContext(AppContext);
};

export const AppContextProvider = ({ children }) => {
  const { user, isLoaded } = useUser(); // isLoaded ensures Clerk is ready
  const { getToken } = useAuth();

  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);

  const createNewChat = async () => {
    try {
      if (!user || !isLoaded) return;

      const token = await getToken();
      await axios.post(
        "/api/chat/create",
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      fetchUsersChats();
    } catch (error) {
      console.error("Create chat error:", error);
      toast.error(error.message);
    }
  };

  const fetchUsersChats = async () => {
    try {
      const token = await getToken();
      const { data } = await axios.get("/api/chat/get", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (data.success) {
        let chats = data.data;
        console.log("Fetched Chats:", chats);

        if (chats.length === 0) {
          await createNewChat();
          return;
        }

        chats.sort(
          (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
        );

        setChats(chats);
        setSelectedChat(chats[0]);
        console.log("Selected Chat:", chats[0]);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Fetch chats error:", error);
      toast.error(error.message);
    }
  };

  useEffect(() => {
    if (user && isLoaded) {
      fetchUsersChats();
    }
  }, [user, isLoaded]);

  const value = {
    user,
    chats,
    setChats,
    selectedChat,
    setSelectedChat,
    fetchUsersChats,
    createNewChat,
  };

  return (
    <AppContext.Provider value={value}>{children}</AppContext.Provider>
  );
};
