import React, { useState, useRef, useEffect } from 'react';
import './chat.css';
import Newprompt from './../../components/newprompt';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import Markdown from 'react-markdown';
import { IKImage } from 'imagekitio-react';

const Chat = () => {
  const { id } = useParams();
  const chatId = Number(id); // Convert to number
  const wrapperRef = useRef(null);

  const { isPending, error, data } = useQuery({
    queryKey: ["chat", chatId],
    queryFn: () =>
      fetch(`${import.meta.env.VITE_API_URL}/api/chat/${chatId}`, {
        credentials: "include",
      }).then((res) => {
        if (!res.ok) throw new Error("Failed to fetch chat");
        return res.json();
      }),
  });

  useEffect(() => {
    if (data && wrapperRef.current) {
      setTimeout(() => {
        wrapperRef.current.scrollTop = wrapperRef.current.scrollHeight;
      }, 100);
    }
  }, [data]);

  useEffect(() => {
    if (wrapperRef.current) {
      setTimeout(() => {
        wrapperRef.current.scrollTop = wrapperRef.current.scrollHeight;
      }, 200);
    }
  }, []);

  return (
    <div className='chat'>
      <div className="wrapper" ref={wrapperRef}>
        <div className="chats">
          {isPending
            ? "loading..."
            : error
              ? "something went wrong..."
              : data?.history?.map((message, i) => (
                <React.Fragment key={i}>
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
                  <div className={message.role === "user" ? "message user" : "message"}>
                    <Markdown>{message.parts[0].text}</Markdown>
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
