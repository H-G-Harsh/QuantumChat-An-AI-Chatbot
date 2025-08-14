import './dashboard.css'
import { useMutation,useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { createChat } from '../../lib/api';

const Dashboard = () => {
  const queryClient = useQueryClient()
  const navigate =useNavigate()
  const mutation = useMutation({
    mutationFn: createChat,
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

  const handleOptionClick = (optionType) => {
    let promptText = "";
    
    switch(optionType) {
      case "new-chat":
        // Just open a new chat without any specific prompt
        mutation.mutate("Hello");
        break;
      case "image-analysis":
        promptText = "I'll upload images, analyse them";
        mutation.mutate(promptText);
        break;
      case "coding-assistant":
        promptText = "I need help with coding";
        mutation.mutate(promptText);
        break;
      case "help-write":
        promptText = "Help me write";
        mutation.mutate(promptText);
        break;
      default:
        mutation.mutate("Hello");
    }
  }
  return (
    <div className='dashboard'>
      <div className="texts">
        
          <div className="logo">
            <img src="/final.jpg" alt="" />
            <h1>QuantumChat</h1>
          </div>
          <div className="options">
            <div className="option" onClick={() => handleOptionClick("new-chat")}>
              <img src="/dash1.webp" alt="" />
              <span>Open a New Chat</span>
            </div>
            <div className="option" onClick={() => handleOptionClick("image-analysis")}>
              <img src="/dash2.jpg" alt="" />
              <span>Image Analysis</span>
            </div>
            <div className="option" onClick={() => handleOptionClick("coding-assistant")}>
              <img src="/dash3.jpg" alt="" />
              <span>Coding Assistant</span>
            </div>
            <div className="option" onClick={() => handleOptionClick("help-write")}>
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