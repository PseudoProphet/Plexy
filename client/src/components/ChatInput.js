import React from "react";

const ChatInput = ({ onSubmit, setQuery }) => {
  const handleQueryChange = (event) => {
    setQuery(event.target.value);
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      onSubmit(event.target.value); // Pass the current value from the input
    }
  };

  return (
    <div className="input-area">
      <textarea
        placeholder="Enter your query here..."
        onChange={handleQueryChange}
        onKeyDown={handleKeyDown}
        className="query-input"
      />
      <button onClick={() => onSubmit(document.querySelector('.query-input').value)} className="submit-button">
        Ask
      </button>
    </div>
  );
};

export default ChatInput;