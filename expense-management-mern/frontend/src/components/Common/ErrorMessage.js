import React from 'react';

const ErrorMessage = ({ message, onRetry }) => {
  return (
    <div className="alert alert-danger d-flex align-items-center" role="alert">
      <i className="fas fa-exclamation-triangle me-3"></i>
      <div className="flex-grow-1">
        {message || 'Something went wrong. Please try again.'}
      </div>
      {onRetry && (
        <button className="btn btn-outline-danger btn-sm" onClick={onRetry}>
          <i className="fas fa-redo me-1"></i>
          Retry
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;
