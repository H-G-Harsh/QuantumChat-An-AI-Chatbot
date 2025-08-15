import './newprompt.css';
import { useRef, useEffect, useState } from 'react';
import Upload from './upload';
import { IKImage } from 'imagekitio-react';
import model from "./../lib/gemini";
import Markdown from "react-markdown";
import { useMutation, useQueryClient } from '@tanstack/react-query';
import Suggestions from "./../routes/chatpage/suggestions";
import { updateChat } from '../lib/api';

const Newprompt = ({ data }) => {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [img, setImg] = useState({
    isLoading: false,
    error: "",
    dbData: {},
    aiData: {}
  });
  const [suggestions, setSuggestions] = useState([]); // State for suggestions
  const [loadingSuggestions, setLoadingSuggestions] = useState(false); // Tracks if suggestions are loading
  const [isTyping, setIsTyping] = useState(false); // Tracks user typing

  const chat = model.startChat({
    history: [
      {
        role: "user",
        parts: [{ text: "Hello" }],
      },
      {
        role: "model",
        parts: [{ text: "Great to meet you. What would you like to know?" }],
      },
    ],
  });

  const endRef = useRef(null);
  const formRef = useRef(null);
  const inputRef = useRef(null);
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);

  useEffect(() => {
    // Only auto-scroll when answer changes, not when suggestions appear or when typing
    if (endRef.current && !isTyping && answer) {
      setTimeout(() => {
        endRef.current.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  }, [data, answer, img.dbData, isTyping]);

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

  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: () => {
      return updateChat(data._id, {
        question: question.length ? question : undefined,
        answer,
        img: img.dbData?.filePath || undefined,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chat", data._id] }).then(() => {
        setQuestion("");
        setAnswer(""); // Clear the live answer since it's now in chat history
        setImg({
          isLoading: false,
          error: "",
          dbData: {},
          aiData: {}
        });
        setIsTyping(false); // Stop typing after response
        // Don't call fetchSuggestions here - it's already called in add function
      });
    },
    onError: (err) => {
      console.log(err);
    },
  });
  // Function to check if user is asking about AI identity
  const checkIdentityQuestion = (text) => {
    const identityKeywords = [
      'who are you', 'what are you', 'tell me about yourself', 
      'introduce yourself', 'your name', 'who am i talking to',
      'what is your name', 'identify yourself'
    ];
    
    const lowerText = text.toLowerCase();
    return identityKeywords.some(keyword => lowerText.includes(keyword));
  };

  const add = async (text, isInitial, imageData = null) => {
    if (!isInitial) setQuestion(text);
  
    // Use provided imageData or current img state
    const imgToUse = imageData || img;
  
    // Restore image data BEFORE processing if we have it
    if (imageData && imageData.dbData?.filePath) {
      setImg(imageData);
    }

    // Check if user is asking about identity and provide QuantumChat response
    if (checkIdentityQuestion(text)) {
      const quantumChatResponse = "Hello! I am QuantumChat, an AI chatbot that leverages Google's Gemini AI to cater to your queries and provide helpful, accurate responses. I'm here to assist you with a wide range of topics including answering questions, helping with analysis, creative tasks, problem-solving, and much more. What would you like to know or discuss today?";
      
      setAnswer(quantumChatResponse);
      
      setTimeout(() => {
        mutation.mutate();
        if (quantumChatResponse.length > 10) {
          fetchSuggestions(quantumChatResponse);
        }
      }, 100);
      
      return;
    }
  
    try {
      const result = await chat.sendMessageStream(
        Object.entries(imgToUse.aiData || {}).length ? [imgToUse.aiData, text] : [text]
      );
  
      let accres = ""; // Accumulated response
      let chunkCount = 0;
  
      // Process each chunk from the stream
      for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        accres += chunkText;
        chunkCount++;
        setAnswer(accres);
        console.log(`Chunk ${chunkCount}:`, chunkText);
      }
      
      console.log('Stream completed. Total chunks:', chunkCount);
      console.log('Complete AI response length:', accres.length);
      console.log('Complete AI response:', accres);
      
      // Ensure the final answer is set
      setAnswer(accres);
      
      // Small delay to ensure state is updated
      setTimeout(() => {
        // Wait for mutation to complete before fetching suggestions
        mutation.mutate();
        
        // Fetch suggestions using the complete AI response, not the original text
        if (accres && accres.length > 10) {
          fetchSuggestions(accres);
        }
      }, 100);
      
    } catch (err) {
      console.error("Error in add function:", err);
      console.error("Error details:", err.message, err.stack);
    }
  };
  const fetchSuggestions = async (text) => {
    try {
      setLoadingSuggestions(true);
      console.log('Fetching suggestions for AI response:', text.substring(0, 100) + '...');
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/generate-response`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: text }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Suggestions API response:', data);
      
      if (data.follow_up_questions && Array.isArray(data.follow_up_questions) && data.follow_up_questions.length > 0) {
        // Add a delay of 2 seconds before updating the state
        setTimeout(() => {
          setSuggestions(data.follow_up_questions);
          setLoadingSuggestions(false);
        }, 2000);
      } else {
        console.warn('No valid follow_up_questions in response, not showing suggestions');
        setLoadingSuggestions(false);
        // Don't show fallback suggestions - just don't show any
      }
    } catch (err) {
      console.error("Error in fetchSuggestions:", err);
      setLoadingSuggestions(false);
      // Don't show fallback suggestions on error - just don't show any
    }
  };
  
  
  
  
  

  const handlesubmit = async (e) => {
    e.preventDefault();
    const text = e.target.text.value;
    if (!text) return;
    
    // Store current image data before clearing UI
    const currentImgData = { ...img };
    
    // Blur input to close keyboard on mobile
    if (inputRef.current) {
      inputRef.current.blur();
    }
    
    // Clear form text immediately for better UX
    formRef.current.reset();
    
    // Clear previous answer when starting new conversation
    setAnswer("");
    
    // Clear only the preview (dbData) but keep the actual data
    setImg(prev => ({
      ...prev,
      dbData: {}, // Clear preview
      // Keep aiData for AI processing
    }));
    
    setIsTyping(false); // Stop typing on submit
    setIsKeyboardOpen(false); // Close keyboard state
    setLoadingSuggestions(false); // Hide suggestions immediately when submitting
    setSuggestions([]); // Clear suggestions immediately
    
    // Pass the stored image data to add function
    add(text, false, currentImgData);
  };

  const handleInputChange = (e) => {
    setIsTyping(true); // Start typing
    setLoadingSuggestions(false); // Hide suggestions while typing
    setSuggestions([]); // Clear suggestions while typing
  };

  const handleSuggestionClick = (suggestion) => {
    setSuggestions([]); // Clear suggestions
    setLoadingSuggestions(false); // Hide loading state if applicable
    add(suggestion, false); // Add the selected suggestion
  };

  const processedChatId = useRef(null);
  useEffect(() => {
    if (data?.history?.length === 1 && processedChatId.current !== data._id) {
      processedChatId.current = data._id;
      add(data.history[0].parts[0].text, true);
    }
  }, [data]);

  return (
    <>
      {question && <div className="message user">{question}</div>}
      {answer && <div className="message"><Markdown>{answer}</Markdown></div>}

      {/* Conditional rendering for suggestions */}
      {!loadingSuggestions && suggestions.length > 0 && (
        <div className="suggestions-block">
          <Suggestions suggestions={suggestions} handleSuggestionClick={handleSuggestionClick} />
        </div>
      )}

      <div className="end" ref={endRef}></div>

      <div className={`form-container ${isKeyboardOpen ? 'keyboard-open' : ''}`}>
        {/* Image preview above the form */}
        {img.isLoading && (
          <div className="image-preview-container">
            <div className="image-loading">
              <div className="loading-spinner"></div>
              <span>Uploading image...</span>
            </div>
          </div>
        )}
        
        {img.dbData?.filePath && (
          <div className="image-preview-container">
            <div className="image-preview">
              <IKImage
                urlEndpoint={import.meta.env.VITE_IMAGE_KIT_ENDPOINT}
                path={img.dbData?.filePath}
                width="120"
                height="120"
                transformation={[{ width: 120, height: 120 }]}
                className="preview-image"
              />
              <button 
                onClick={() => setImg({ isLoading: false, error: "", dbData: {}, aiData: {} })}
                className="remove-image-btn"
                type="button"
              >
                ×
              </button>
            </div>
          </div>
        )}

        <form className="newform" onSubmit={handlesubmit} ref={formRef}>
          <Upload setImg={setImg} />
          <input
            id="file"
            type="file"
            accept="image/*"
            multiple={false}
            hidden
          />
          <input
            ref={inputRef}
            type="text"
            name="text"
            placeholder="Ask anything...."
            onChange={handleInputChange} // Detect typing
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck="false"
          />
          <button id="arr" type="submit">
            <img src="/arrow.png" alt="" />
          </button>
        </form>
      </div>
    </>
  );
};

export default Newprompt;
