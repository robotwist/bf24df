import React from 'react';

interface DemoModeToggleProps {
  isDemoMode: boolean;
  onToggle: () => void;
}

const DemoModeToggle = ({ isDemoMode, onToggle }: DemoModeToggleProps): JSX.Element => {
  return (
    <div className="flex items-center space-x-2">
      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          className="sr-only peer"
          checked={isDemoMode}
          onChange={onToggle}
        />
        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
        <span className="ml-3 text-sm font-medium text-gray-900">Demo Mode</span>
      </label>
    </div>
  );
};

export { DemoModeToggle }; 