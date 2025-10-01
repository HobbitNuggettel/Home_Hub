import React from 'react';

/**
 * Mobile Navigation List Component
 * Renders navigation items with enhanced mobile experience
 */
const MobileNavigationList = ({ items, onNavigate }) => {
  return (
    <nav className="space-y-2 pb-4">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <button
            key={item.name}
            onClick={() => onNavigate(item.href)}
            className="w-full text-left p-4 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 active:bg-gray-200 dark:active:bg-gray-600 transition-all duration-200 group touch-manipulation border border-transparent hover:border-gray-200 dark:hover:border-gray-600 min-h-[44px] min-w-[44px]"
          >
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Icon className="text-gray-400 dark:text-gray-500 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" size={22} />
                {item.badge && (
                  <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full animate-pulse">
                    {item.badge}
                  </span>
                )}
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {item.name}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors">
                  {item.description}
                </p>
              </div>
            </div>
          </button>
        );
      })}
    </nav>
  );
};

export default MobileNavigationList;
