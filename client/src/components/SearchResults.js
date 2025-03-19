import React from "react";

export const SearchResults = ({ results }) => {
  return (
    results &&
    results.length > 0 && (
      <div className="google-search-results">
        <p>
          <b>Google Search Results:</b>
        </p>
        <ul>
          {results.map((result, rIndex) => (
            <li key={rIndex} className="search-result">
              <a
                href={result.googleSearchUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                {result.googleSearchTitle}
              </a>
            </li>
          ))}
        </ul>
      </div>
    )
  );
};