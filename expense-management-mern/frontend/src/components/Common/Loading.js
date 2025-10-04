import React from 'react';

const Loading = ({ text = 'Loading...' }) => {
  return (
    <div className="d-flex flex-column justify-content-center align-items-center p-5">
      <div className="loading-spinner mb-3"></div>
      <p className="text-muted">{text}</p>
    </div>
  );
};

export default Loading;
