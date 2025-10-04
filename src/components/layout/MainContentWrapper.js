import React from 'react';
import PropTypes from 'prop-types';

const MainContentWrapper = ({ children }) => {
  return (
    <div className="relative">
      {/* Main Content */}
      {children}
    </div>
  );
};

MainContentWrapper.propTypes = {
  children: PropTypes.node.isRequired,
};

export default MainContentWrapper;
