import React from 'react';

const OrDivider: React.FC = () => {
  return (
    <div className="relative w-full my-6">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-gray-300"></div>
      </div>
      <div className="relative flex justify-center text-sm">
        <span className="bg-white dark:bg-gray-900 px-4 text-gray-500 dark:text-gray-400">
          OR
        </span>
      </div>
    </div>
  );
};

export default OrDivider;