import './dashboard.css'
import { useAuth } from '@clerk/clerk-react';
import { useMutation,useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const queryClient = useQueryClient()
  const navigate =useNavigate()
  const mutation = useMutation({
    mutationFn: (text)=>{
      return fetch(`${import.meta.env.VITE_API_URL}/api/chats`,{
        method:"POST",
        credentials:"include",
        headers:{
          "Content-Type":"application/json"
        },
        body:JSON.stringify({text}),
      }).then((res)=>res.json());
    },
    onSuccess: (id) => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ["userChats"] });
      navigate(`/dashboard/chat/${id}`);
    },
  })
  const handleSubmit=async (e) => {
    e.preventDefault();
    const text=e.target.text.value;
    if(!text) return;
    mutation.mutate(text);
  }
  return (
    <div className='dashboard'>
      <div className="texts">
        
          <div className="logo">
            <img src="/final.jpg" alt="" />
            <h1>QuantumChat</h1>
          </div>
          <div className="options">
            <div className="option">
              <img src="/dash1.webp" alt="" />
              <span>Open a New Chat</span>
            </div>
            <div className="option">
              <img src="/dash2.jpg" alt="" />
              <span>Image Analysis</span>
            </div>
            <div className="option">
              <img src="/dash3.jpg" alt="" />
              <span>Coding Assistant</span>
            </div>
            <div className="option">
              <img src="/dash4.jpg" alt="" />
              <span>Help me write</span>
            </div>
          </div>
        </div>
        <div className="formcontainer">
            <form onSubmit={handleSubmit}>
              <input type="text" name="text" placeholder="Ask me anything....." />
              <button>
                <img src="/arrow.png" alt="" /></button>
            </form>
        </div>
    </div>
  )
}

export default Dashboard