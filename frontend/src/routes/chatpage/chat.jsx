import React, { useState } from 'react';
import './chat.css'; // Import your chat styles
import Newprompt from './../../components/newprompt';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'react-router-dom';
import Markdown from 'react-markdown';
import { IKImage } from 'imagekitio-react';

const Chat = () => {
  const path = useLocation().pathname;
  const chatId = path.split("/").pop();

  const { isPending, error, data } = useQuery({
    queryKey: ["chat", chatId],
    queryFn: () =>
      fetch(`${import.meta.env.VITE_API_URL}/api/chat/${chatId}`, {
        credentials: "include",
      }).then((res) => res.json()),
  });

  // if (data) {
  //   console.log("Chat history:", data?.history); // Debugging line
  // }


  return (
    <div className='chat'>
      <div className="wrapper">
        <div className="chats">
          {isPending
            ? "loading..."
            : error
              ? "something went wrong..."
              : data?.history?.map((message, i) => (
                <>
                  {message.img && (
                    <IKImage
                      urlEndpoint={import.meta.env.VITE_IMAGE_KIT_ENDPOINT}
                      path={message.img}
                      height="300"
                      width="400"
                      transformation={[{ height: "300", width: "400" }]}
                      loading="lazy"
                      lqip={{ active: true, quality: 20 }}
                    />
                  )}
                  <div className={message.role === "user" ? "message user" : "message"} key={i}>
                    <Markdown>{message.parts[0].text}</Markdown>
                  </div>
                </>
              ))}
              
        
          {data &&
           <Newprompt data={data} />}
          
        </div>
      </div>
    </div>
  );
};

export default Chat;
