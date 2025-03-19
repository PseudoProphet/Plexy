import React, { useState, useEffect, useRef } from "react";
import "./App.css";
import ChatInput from "./components/ChatInput";
import ChatMessage from "./components/ChatMessage";

function App() {
  const [query, setQuery] = useState(""); // Define query state here
  const [chatHistory, setChatHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const chatHistoryRef = useRef(null);

  const handleStreamedSubmit = async (newQuery) => {
    if (!newQuery.trim()) return;
    setIsLoading(true);
    setIsTyping(true);

    const newChatEntry = {
      query: newQuery,
      response: { text: "", followUpQuestions: [], googleSearch: [] },
    };

    // Add a temporary entry with a loading message
    setChatHistory((prevChatHistory) => [
      ...prevChatHistory,
      { ...newChatEntry, response: { text: "_Loading..._" } },
    ]);

    try {
      const encodedQuery = encodeURIComponent(newQuery);
      const eventSource = new EventSource(
        `http://localhost:5000/api/stream?query=${encodedQuery}`
      );

      let fullResponse = ""; // Accumulate the full response here

      eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data);

        if (data.type === "text") {
          fullResponse += data.content; // Append to fullResponse

          setChatHistory((prevChatHistory) => {
            const updatedChatHistory = [...prevChatHistory];
            const latestResponseIndex = updatedChatHistory.length - 1;
            updatedChatHistory[latestResponseIndex].response.text =
              fullResponse; // Update with fullResponse
            return updatedChatHistory;
          });
        } else if (data.type === "metadata") {
          setChatHistory((prevChatHistory) => {
            const updatedChatHistory = [...prevChatHistory];
            const latestResponseIndex = updatedChatHistory.length - 1;
            updatedChatHistory[latestResponseIndex].response.googleSearch =
              data.content.googleSearch;
            return updatedChatHistory;
          });

          setIsTyping(false);
          eventSource.close();

          // Await follow-up questions after initial response is complete
          fetchFollowUpQuestions(
            newQuery,
            fullResponse // Pass the full response
          );
        }
      };

      eventSource.onerror = (error) => {
        console.error("EventSource failed:", error);
        setIsTyping(false);
        setIsLoading(false);
        eventSource.close();
      };
    } catch (error) {
      console.error("Error fetching response:", error);
      setIsTyping(false);
      setIsLoading(false);
    }
  };

  const fetchFollowUpQuestions = async (
    originalQuery
  ) => {
    try {
      const encodedQuery = encodeURIComponent(originalQuery);
      const response = await fetch(
        `http://localhost:5000/api/followup?originalQuery=${encodedQuery}`
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();

      if (data.followUpQuestions) {
        setChatHistory((prevChatHistory) => {
          const newChatHistory = [...prevChatHistory];
          const latestResponseIndex = newChatHistory.length - 1;
          newChatHistory[latestResponseIndex].response.followUpQuestions =
            data.followUpQuestions;
          return newChatHistory;
        });
      }
    } catch (error) {
      console.error("Error fetching follow-up questions:", error);
    }
  };

  const handleFollowUpClick = (question) => {
    setQuery(question);
    handleStreamedSubmit(question);
  };

  // Scroll to the bottom of the chat history when a new message is added
  useEffect(() => {
    if (chatHistoryRef.current) {
      chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
    }
  }, [chatHistory]);

  return (
    <div className="app-container">
      <h1 className="app-title">
        <span style={{ color: "#4285F4" }}>G</span>
        <span style={{ color: "#DB4437" }}>o</span>
        <span style={{ color: "#F4B400" }}>o</span>
        <span style={{ color: "#4285F4" }}>g</span>
        <span style={{ color: "#0F9D58" }}>l</span>
        <span style={{ color: "#DB4437" }}>y</span>
        </h1>
        <ChatInput onSubmit={handleStreamedSubmit} setQuery={setQuery} />  
      <div className="chat-history" ref={chatHistoryRef}>
        {chatHistory.map((chat, index) => (
          <ChatMessage
            key={index}
            chat={chat}
            isTyping={isTyping && index === chatHistory.length - 1}
            onFollowUpClick={handleFollowUpClick}
          />
        ))}
      </div>
    </div>
  );
}

export default App;