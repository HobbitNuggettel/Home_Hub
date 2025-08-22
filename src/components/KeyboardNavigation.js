import React, { useEffect } from 'react';

const KeyboardNavigation = ({ children }) => {
  useEffect(() => {
    const handleKeyDown = (event) => {
      // Escape key to close modals or menus
      if (event.key === 'Escape') {
        // You can add logic here to close modals or menus
        const activeElement = document.activeElement;
        if (activeElement && activeElement.blur) {
          activeElement.blur();
        }
      }

      // Tab key navigation enhancement
      if (event.key === 'Tab') {
        // Add focus indicators for keyboard navigation
        document.body.classList.add('keyboard-navigation');
      }
    };

    const handleMouseDown = () => {
      // Remove keyboard navigation class when using mouse
      document.body.classList.remove('keyboard-navigation');
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleMouseDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, []);

  return <>{children}</>;
};

export default KeyboardNavigation;
