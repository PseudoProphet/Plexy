import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import { TypingIndicator } from "./TypingIndicator";
import { FollowUpQuestions } from "./FollowUpQuestions";
import { SearchResults } from "./SearchResults";

const ChatMessage = ({ chat, isTyping, onFollowUpClick }) => {
  return (
    <div className="chat-block">
      <div className="user-query">
        <p>
          <b>You:</b> {chat.query}
        </p>
      </div>
      <div className="response-block">
        <ReactMarkdown
          className="response"
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[
            rehypeRaw,
            [
              rehypeSanitize,
              {
                tagNames: [
                  // ... your allowed tags
                ],
                attributes: {
                  // ... your allowed attributes
                },
              },
            ],
          ]}
          components={{
            a: ({ node, ...props }) => (
              <a {...props} target="_blank" rel="noopener noreferrer">
                {props.children}
              </a>
            ),
            table: ({ node, ...props }) => (
              <table {...props} className="markdown-table" />
            ),
          }}
        >
          {chat.response.text}
        </ReactMarkdown>

        {isTyping && <TypingIndicator />}

        <FollowUpQuestions
          questions={chat.response.followUpQuestions}
          onClick={onFollowUpClick}
        />
        <SearchResults results={chat.response.googleSearch} />
      </div>
    </div>
  );
};

export default ChatMessage;