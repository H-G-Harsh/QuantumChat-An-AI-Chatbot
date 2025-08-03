import './newprompt.css';
import { useRef, useEffect, useState } from 'react';
import Upload from './upload';
import { IKImage } from 'imagekitio-react';
import model from "./../lib/gemini";
import Markdown from "react-markdown";
import { useMutation, useQueryClient } from '@tanstack/react-query';
import Suggestions from "./../routes/chatpage/suggestions";

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

  // Correct Code
const chat = model.startChat({
  history: data?.history?.map(({ role, parts }) => ({
    role,
    parts: [{ text: parts[0].text }],
  })) || [], // Use the mapped array directly or an empty array
  generationConfig: {
    // maxOutputTokens: 100,
  },
});

  const endRef = useRef(null);
  const formRef = useRef(null);

  useEffect(() => {
    endRef.current.scrollIntoView({ behavior: "smooth" });
  }, [data, question, answer, img.dbData]);

  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: () => {
      return fetch(`${import.meta.env.VITE_API_URL}/api/chats/${data._id}`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: question.length ? question : undefined,
          answer,
          img: img.dbData?.filePath || undefined,
        }),
      }).then((res) => res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chat", data._id] }).then(() => {
        formRef.current.reset();
        setQuestion("");
        setAnswer("");
        setImg({
          isLoading: false,
          error: "",
          dbData: {},
          aiData: {}
        });
        setIsTyping(false); // Stop typing after response
        setLoadingSuggestions(false); // Stop loading suggestions after successful mutation
        fetchSuggestions(question); // Fetch new suggestions
      });
    },
    onError: (err) => {
      console.log(err);
    },
  });
  const add = async (text, isInitial) => {
    if (!isInitial) setQuestion(text);
  
    try {
      const result = await chat.sendMessageStream(
        Object.entries(img.aiData).length ? [img.aiData, text] : [text]
      );
  
      let accres = ""; // Accumulated response
      let lastChunk = ""; // Variable to hold the last chunk
  
      // Process each chunk from the stream
      for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        accres+=chunkText;
        setAnswer(accres);
      }// Append the last chunk to the existing answer
      setAnswer(accres);
      console.log(accres); // Log the full accumulated response
  
      // Fetch suggestions after the message is processed
      
      mutation.mutate();
      fetchSuggestions(text); // Call mutation after updating the answer
    } catch (err) {
      console.error("Error in add function:", err);
    }
  };
  const fetchSuggestions = async (text) => {
    try {
      setLoadingSuggestions(true); 
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/generate-response`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: text }),
      });
      const data = await response.json();
      if (data.follow_up_questions) {
        // Add a delay of 3 seconds before updating the state
        setTimeout(() => {
          setSuggestions(data.follow_up_questions);
          setLoadingSuggestions(false); // Stop loading state after delay
        }, 3000);
      }
    } catch (err) {
      console.error("Error in fetchSuggestions:", err);
      setLoadingSuggestions(false); // Stop loading state on error
    }
  };
  
  
  
  
  

  const handlesubmit = async (e) => {
    e.preventDefault();
    const text = e.target.text.value;
    if (!text) return;
    setIsTyping(false); // Stop typing on submit
    setLoadingSuggestions(false); // Hide suggestions immediately when submitting
    setSuggestions([]); // Clear suggestions immediately
    add(text);
    //formRef.current.reset();
    
  };

  const handleInputChange = (e) => {
    setIsTyping(true); // Start typing
    setLoadingSuggestions(false); // Hide suggestions while typing
    setSuggestions([]); // Clear suggestions while typing
  };

  const handleSuggestionClick = (suggestion) => {
    setSuggestions([]); // Clear suggestions
    setLoadingSuggestions(false); // Hide loading state if applicable
    add(suggestion); // Add the selected suggestion
  };

  const hasRun = useRef(false);
  useEffect(() => {
    if (!hasRun.current && data?.history?.length === 1) {
      add(data.history[0].parts[0].text, true);
    }
    hasRun.current = true;
  }, []);

  return (
    <>
      {img.isLoading ? (
  <div>Loading...</div>
) : (
  <>
    {img.dbData?.filePath && (
      <IKImage
        urlEndpoint={import.meta.env.VITE_IMAGE_KIT_ENDPOINT}
        path={img.dbData?.filePath}
        width="400"
        height="400"
        transformation={[{ width: 400, height: 400 }]}
        onError={() => setImg({ ...img, error: "Image failed to load" })} // Handle image load error
      />
    )}
    {/* Display the file name if the image fails to load */}
    {img.dbData?.filePath && img.error && (
      <div className="file-name">
        {img.dbData.filePath.split("/").pop()}
      </div>
    )}
  </>
)}

      {question && <div className="message user">{question}</div>}
      {answer && <div className="message"><Markdown>{answer}</Markdown></div>}

      {/* Conditional rendering for suggestions */}
      {!loadingSuggestions && suggestions.length > 0 && (
        <div className="suggestions-block">
          <Suggestions suggestions={suggestions} handleSuggestionClick={handleSuggestionClick} />
        </div>
      )}

      <div className="end" ref={endRef}></div>

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
          type="text"
          name="text"
          placeholder="Ask anything...."
          onChange={handleInputChange} // Detect typing
        />
        <button id="arr">
          <img src="/arrow.png" alt="" />
        </button>
      </form>
    </>
  );
};

export default Newprompt;
