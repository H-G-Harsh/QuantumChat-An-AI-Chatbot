import React, { useState, useRef, useEffect } from 'react';
import './chat.css'; // Import your chat styles
import Newprompt from './../../components/newprompt';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'react-router-dom';
import Markdown from 'react-markdown';
import { IKImage } from 'imagekitio-react';
import { getChat } from '../../lib/api';

const Chat = () => {
  const path = useLocation().pathname;
  const chatId = path.split("/").pop();
  const wrapperRef = useRef(null);

  const { isPending, error, data } = useQuery({
    queryKey: ["chat", chatId],
    queryFn: () => getChat(chatId),
  });

  // Debug logging
  if (error) {
    console.error('Chat loading error:', error);
  }
  if (data) {
    console.log('Chat data loaded:', data);
  }

  // Scroll to bottom when data changes (chat history loads)
  useEffect(() => {
    if (data && wrapperRef.current) {
      setTimeout(() => {
        wrapperRef.current.scrollTop = wrapperRef.current.scrollHeight;
      }, 100);
    }
  }, [data]);

  // Scroll to bottom when component mounts
  useEffect(() => {
    if (wrapperRef.current) {
      setTimeout(() => {
        wrapperRef.current.scrollTop = wrapperRef.current.scrollHeight;
      }, 200);
    }
  }, []);

  // if (data) {
  //   console.log("Chat history:", data?.history); // Debugging line
  // }


  return (
    <div className='chat'>
      <div className="wrapper" ref={wrapperRef}>
        <div className="chats">
          {isPending
            ? "loading..."
            : error
              ? `Error loading chat: ${error.message}`
              : data?.history?.map((message, i) => (
                <React.Fragment key={i}>
                  <div className={message.role === "user" ? "message user" : "message"}>
                    {message.img && (
                      <div className="message-image">
                        <IKImage
                          urlEndpoint={import.meta.env.VITE_IMAGE_KIT_ENDPOINT}
                          path={message.img}
                          width="200"
                          height="200"
                          transformation={[{ width: 200, height: 200 }]}
                          className="chat-image"
                        />
                      </div>
                    )}
                    <div className="message-content">
                      <Markdown>{message.parts[0].text}</Markdown>
                    </div>
                  </div>
                </React.Fragment>
              ))}
              
          {data && <Newprompt data={data} />}
        </div>
      </div>
    </div>
  );
};

export default Chat;
