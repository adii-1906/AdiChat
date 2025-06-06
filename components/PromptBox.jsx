import { assets } from '@/assets/assets'
import { useAppContext } from '@/context/AppContext';
import axios from 'axios';
import Image from 'next/image'
import React, { useState, useRef } from 'react'
import toast from 'react-hot-toast';

const PromptBox = ({isLoading, setIsLoading}) => {

  const [prompt, setPrompt] = useState('');
  const {user, chats, setChats, selectedChat, setSelectedChat} = useAppContext();

  // Ref for hidden file input
  const fileInputRef = useRef(null);

  const handleKeyDown = (e) => {
    if(e.key === "Enter" && !e.shiftKey){
      e.preventDefault();
      sendPrompt(e);
    }
  }

  // Trigger file input click when pin icon is clicked
  const handlePinClick = () => {
    if (!user) {
      return toast.error('Please login to upload files');
    }
    fileInputRef.current?.click();
  }

  // Handle file selection
  const handleFileChange = async (event) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    if (!user) return toast.error('Login to upload files');

    setIsLoading(true);

    try {
      // For demo, we will just pick the first file
      const file = files[0];

      // Create FormData to send file to server
      const formData = new FormData();
      formData.append('file', file);
      formData.append('chatId', selectedChat._id);

      // Optionally include prompt content as query or context
      formData.append('prompt', prompt);

      // You should create an API route `/api/chat/upload` to handle file upload and searching
      const { data } = await axios.post('/api/chat/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if(data.success){
        toast.success('File processed and search results added to chat');

        // Add returned messages or results to chats & selectedChat
        setChats((prevChats) => prevChats.map(chat =>
          chat._id === selectedChat._id ? { ...chat, messages: [...chat.messages, ...data.data] } : chat
        ));
        setSelectedChat((prev) => ({
          ...prev,
          messages: [...prev.messages, ...data.data]
        }));
      } else {
        toast.error(data.message || 'Failed to process file');
      }

    } catch (error) {
      toast.error(error.message || 'File upload failed');
    } finally {
      setIsLoading(false);
      event.target.value = null; // reset file input
    }
  }

  const sendPrompt = async(e)=> {
    const promptCopy = prompt;

    try {
      e.preventDefault();
      if(!user) return toast.error('Login to send message');
      if(isLoading) return toast.error('Wait for the previous prompt response');

      setIsLoading(true);
      setPrompt("");

      const userPrompt = {
        role: "user",
        content: prompt,
        timestamp: Date.now()
      }

      setChats((prevChats)=> prevChats.map((chat)=> chat._id === selectedChat._id ? {
        ...chat,
        messages: [...chat.messages, userPrompt]
      }: chat))

      setSelectedChat((prev) => ({
        ...prev,
        messages: [...prev.messages, userPrompt]
      }))

      const {data} = await axios.post('/api/chat/ai', {
        chatId: selectedChat._id,
        prompt
      })

      if(data.success){
        setChats((prevChats)=> prevChats.map((chat)=> chat._id === selectedChat._id ? {...chat, messages: [...chat.messages, data.data]} : chat))

        const message = data.data.content;
        const messageTokens = message.split(" ");
        let assistantMessage = {
          role: "assistant",
          content: "",
          timestamp: Date.now()
        }

        setSelectedChat((prev)=> ({
          ...prev,
          messages: [...prev.messages, assistantMessage]
        }))

        for (let i = 0; i < messageTokens.length; i++) {
          setTimeout(() => {
            assistantMessage.content = messageTokens.slice(0,i+1).join(" ");
            setSelectedChat((prev)=> {
              const updatedMessages = [
                ...prev.messages.slice(0,-1),
                assistantMessage
              ]
              return {
                ...prev, messages: updatedMessages
              }
            })
          }, i*100)
        }
      } else {
        toast.error(data.message)
        setPrompt(promptCopy);
      }
    } catch (error) {
      toast.error(error.message)
      setPrompt(promptCopy);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <form onSubmit={sendPrompt} className={`w-full ${selectedChat?.messages.length > 0 ? 'max-w-3xl' : 'max-w-2xl'} bg-[#404045] p-4 rounded-3xl mt-4 transition-all`}>
        <textarea
          onKeyDown={handleKeyDown}
          rows={2}
          placeholder='Message AdiChat'
          className='outline-none w-full resize-none overflow-hidden break-words bg-transparent'
          onChange={(e) => setPrompt(e.target.value)}
          value={prompt}
          required
        />

        <div className='flex items-center justify-between text-sm'>

          <div className='flex items-center gap-2'>
            <p className='flex items-center gap-2 text-xs border border-gray-300/40 px-2 py-1 rounded-full cursor-pointer hover:bg-gray-500/20 transition'><Image src={assets.deepthink_icon} alt='' className='h-5'/>AdiThink (R1)</p>
            <p className='flex items-center gap-2 text-xs border border-gray-300/40 px-2 py-1 rounded-full cursor-pointer hover:bg-gray-500/20 transition'><Image src={assets.search_icon} alt='' className='h-5'/>Search</p>
          </div>

          <div className='flex items-center gap-2'>
            {/* Hidden file input */}
            <input
              type="file"
              accept="image/*,application/pdf,.doc,.docx,.txt"
              className="hidden"
              ref={fileInputRef}
              onChange={handleFileChange}
              multiple={false}
            />
            <Image
              src={assets.pin_icon}
              alt='Upload file or image'
              className='w-4 cursor-pointer'
              onClick={handlePinClick}
            />
            <button
              className={`${prompt ? 'bg-primary' : 'bg-[#7171a]'} rounded-full p-2 cursor-pointer`}
              type="submit"
              disabled={!prompt}
            >
              <Image src={prompt ? assets.arrow_icon : assets.arrow_icon_dull} alt='' className='w-3.5 aspect-square' />
            </button>
          </div>
        </div>
      </form>
    </>
  )
}

export default PromptBox
