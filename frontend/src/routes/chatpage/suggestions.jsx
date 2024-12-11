import React from 'react';
import "./suggestions.css";

const Suggestions = ({ suggestions, handleSuggestionClick }) => {
  return (
    <div className="suggestions">
      <h4>Suggested Follow-up Questions:</h4>
      {suggestions.length > 0 ? (
        suggestions.map((suggestion, index) => (
          <button
            key={index}
            className="suggestion-button"
            onClick={() => handleSuggestionClick(suggestion)}
          >
            {index + 1}. {suggestion}
          </button>
        ))
      ) : (
        <p>No suggestions available.</p>  // Add this for better UX in case no suggestions
      )}
    </div>
  );
};

export default Suggestions;
