import React from "react";

export const FollowUpQuestions = ({ questions, onClick }) => {
  return (
    questions &&
    questions.length > 0 && (
      <div className="follow-up-questions">
        <p>
          <b>Related Questions:</b>
        </p>
        <ul>
          {questions.map((question, qIndex) => (
            <li
              key={qIndex}
              onClick={() => onClick(question)}
              className="follow-up-question"
            >
              {question}
            </li>
          ))}
        </ul>
      </div>
    )
  );
};