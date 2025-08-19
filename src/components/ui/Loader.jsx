import React from 'react';
import './Loader.css';

export const Loader = ({ type = 'spinner', text = 'Cargando...', size = 'medium' }) => {
  const renderLoader = () => {
    switch (type) {
      case 'dots':
        return (
          <div className="dots-loader">
            <div className="dot"></div>
            <div className="dot"></div>
            <div className="dot"></div>
          </div>
        );
      case 'progress':
        return (
          <div className="progress-loader">
            <div className="progress-bar"></div>
          </div>
        );
      default:
        return <div className={`spinner ${size}`}></div>;
    }
  };

  return (
    <div className="loader-container">
      {renderLoader()}
      {text && <div className="loading-text">{text}</div>}
    </div>
  );
};
