import './chatlist.css';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';

const Chatlist = () => {
  const { isPending, error, data } = useQuery({
    queryKey: ['userChats'],
    queryFn: () =>
      fetch(`${import.meta.env.VITE_API_URL}/api/userchats`, {
        credentials: "include",
      }).then((res) => res.json()),
  });

  return (
    <div className='chatlist'>
      <span className="title">DASHBOARD</span>
      <Link to="/dashboard">Create an new chat</Link>
      <Link to="/">Explore QuantumChat</Link>
      <Link to="/">Contact</Link>
      <hr />
      <span className="title">RECENT CHATS</span>
      <div className="list">
        {isPending 
          ? "loading...." 
          : error
          ? "no chat history" 
          : data
              ?.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) // Sort by newest first
              .map((chat) => (
                <Link to={`/dashboard/chat/${chat._id}`} key={chat._id}>
                  {chat.title}
                </Link>
              ))}
      </div>
      <hr />
      <div className="foot">
        <span>AI may make mistakes. 
          Please verify important information independently.</span>
      </div>
    </div>
  );
};

export default Chatlist;
