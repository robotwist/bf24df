import { render } from '@testing-library/react';
import { createRoot } from 'react-dom/client';
import { act } from 'react-dom/test-utils';

// Create a custom render function that uses React 18's createRoot
const customRender = (ui: React.ReactElement, options = {}) => {
  const container = document.createElement('div');
  const root = createRoot(container);
  
  act(() => {
    root.render(ui);
  });

  return {
    container,
    root,
    ...render(ui, {
      container,
      ...options,
    }),
  };
};

// Re-export everything
export * from '@testing-library/react';

// Override render method
export { customRender as render }; 