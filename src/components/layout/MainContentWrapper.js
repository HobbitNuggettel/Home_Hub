import React from 'react';

const MainContentWrapper = ({ children }) => {
  return (
    <div className="relative">
      {/* Main Content */}
      {children}
    </div>
  );
};

export default MainContentWrapper;
