import './index.css';

import { context  } from '@devvit/web/client';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

export const Splash = () => {
  return (
    <div className="flex flex-col justify-center items-center min-h-screen gap-6 bg-white dark:bg-gray-900 px-6">
      /snoo.png

      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Prayer For Others
        </h1>

        <p className="mt-2 text-gray-600 dark:text-gray-300">
          Welcome {context.username ?? 'Redditor'}!
        </p>

        <p className="mt-3 max-w-md text-gray-600 dark:text-gray-300">
          This app searches the last 30 days of posts and identifies prayer
          requests that have not received any comments. It can then generate a
          report for moderators to review.
        </p>
      </div>

      
    </div>
  );
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Splash />
  </StrictMode>
);