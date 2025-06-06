'use client';
import { assets } from "@/assets/assets";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import ReactMarkdown from "react-markdown";
import rehypePrism from "rehype-prism-plus";

const Message = ({ role, content }) => {
  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);

  const storageKey = `reaction-${btoa(content)}`; // encode to avoid special char issues

  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      const { liked, disliked } = JSON.parse(saved);
      setLiked(liked);
      setDisliked(disliked);
    }
  }, [storageKey]);

  const saveToStorage = (newLiked, newDisliked) => {
    localStorage.setItem(storageKey, JSON.stringify({ liked: newLiked, disliked: newDisliked }));
  };

  const handleLike = () => {
    const newLiked = !liked;
    const newDisliked = false;

    setLiked(newLiked);
    setDisliked(newDisliked);
    saveToStorage(newLiked, newDisliked);

    toast.success(newLiked ? "Liked message" : "Removed like");
  };

  const handleDislike = () => {
    const newDisliked = !disliked;
    const newLiked = false;

    setDisliked(newDisliked);
    setLiked(newLiked);
    saveToStorage(newLiked, newDisliked);

    toast.success(newDisliked ? "Disliked message" : "Removed dislike");
  };

  const copyMessage = () => {
    navigator.clipboard.writeText(content);
    toast.success("Message copied to clipboard");
  };

  return (
    <div className="flex flex-col items-center w-full max-w-3xl text-sm">
      <div className={`flex flex-col w-full mb-8 ${role === "user" ? "items-end" : ""}`}>
        <div className={`group relative flex max-w-2xl py-3 rounded-xl ${role === "user" ? "bg-[#414158] px-5" : "gap-3"}`}>

          {/* Hover Icons */}
          <div className={`opacity-0 group-hover:opacity-100 absolute ${role === "user" ? "-left-16 top-2.5" : "left-9 -bottom-6"} transition-all duration-300`}>
            <div className="flex items-center gap-2 opacity-70">
              {role === "user" ? (
                <>
                  <Image onClick={copyMessage} src={assets.copy_icon} alt="Copy" className="w-4 cursor-pointer" />
                  <Image src={assets.pencil_icon} alt="Edit" className="w-4 cursor-pointer" />
                </>
              ) : (
                <>
                  <Image onClick={copyMessage} src={assets.copy_icon} alt="Copy" className="w-4 cursor-pointer" />
                  <Image src={assets.regenerate_icon} alt="Regenerate" className="w-4 cursor-pointer" />
                  <Image
                    onClick={handleLike}
                    src={assets.like_icon}
                    alt="Like"
                    className={`w-4 cursor-pointer ${liked ? "brightness-150 scale-110" : ""}`}
                  />
                  <Image
                    onClick={handleDislike}
                    src={assets.dislike_icon}
                    alt="Dislike"
                    className={`w-4 cursor-pointer ${disliked ? "brightness-150 scale-110" : ""}`}
                  />
                </>
              )}
            </div>
          </div>

          {/* Content */}
          {role === "user" ? (
            <span className="text-white/90">{content}</span>
          ) : (
            <>
              <Image src={assets.logo_trans}
                alt="Logo"
                className="h-9 w-9 p-1 border border-white/15 rounded-full"
              />
              <div className="space-y-4 w-full overflow-x-auto prose prose-invert max-w-none">
                <ReactMarkdown rehypePlugins={[rehypePrism]}>
                  {content}
                </ReactMarkdown>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Message;
