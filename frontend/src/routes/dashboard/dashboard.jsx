import './dashboard.css'
import { useMutation,useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { createChat } from '../../lib/api';
import { useRef, useEffect, useState } from 'react';

const Dashboard = () => {
  const queryClient = useQueryClient()
  const navigate =useNavigate()
  const inputRef = useRef(null);
  const formRef = useRef(null);
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  
  const mutation = useMutation({
    mutationFn: createChat,
    onSuccess: (id) => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ["userChats"] });
      navigate(`/dashboard/chat/${id}`);
    },
  })

  // Mobile keyboard detection and handling
  useEffect(() => {
    const handleResize = () => {
      if (window.innerHeight < window.screen.height * 0.75) {
        setIsKeyboardOpen(true);
      } else {
        setIsKeyboardOpen(false);
      }
    };

    const handleFocus = () => {
      setTimeout(() => {
        setIsKeyboardOpen(true);
        // Scroll to keep form visible on mobile
        if (window.innerWidth <= 768 && inputRef.current) {
          inputRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 300);
    };

    const handleBlur = () => {
      setTimeout(() => {
        setIsKeyboardOpen(false);
      }, 100);
    };

    // Add event listeners
    window.addEventListener('resize', handleResize);
    if (inputRef.current) {
      inputRef.current.addEventListener('focus', handleFocus);
      inputRef.current.addEventListener('blur', handleBlur);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      if (inputRef.current) {
        inputRef.current.removeEventListener('focus', handleFocus);
        inputRef.current.removeEventListener('blur', handleBlur);
      }
    };
  }, []);

  const handleSubmit=async (e) => {
    e.preventDefault();
    const text=e.target.text.value.trim();
    if(!text) return;
    
    // Blur input to close keyboard on mobile
    if (inputRef.current) {
      inputRef.current.blur();
    }
    
    setIsKeyboardOpen(false); // Close keyboard state
    
    // Reset textarea height
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
    }
    
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
        <div className={`formcontainer ${isKeyboardOpen ? 'keyboard-open' : ''}`}>
            <form onSubmit={handleSubmit} ref={formRef}>
              <textarea 
                ref={inputRef}
                name="text" 
                placeholder="Ask me anything....." 
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck="false"
                rows="1"
                onInput={(e) => {
                  // Auto-resize textarea
                  e.target.style.height = 'auto';
                  e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
              />
              <button type="submit">
                <img src="/arrow.png" alt="" /></button>
            </form>
        </div>
    </div>
  )
}

export default Dashboard