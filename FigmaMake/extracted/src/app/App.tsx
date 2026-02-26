import { RouterProvider } from 'react-router';
import { router } from './routes';
import { useState, useEffect } from 'react';
import { LoadingScreen } from './components/LoadingScreen';

export default function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Show loading screen for a brief moment on initial load
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1200);

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <LoadingScreen isLoading={isLoading} />
      <div 
        className={`transition-opacity duration-700 ease-in-out ${
          isLoading ? 'opacity-0' : 'opacity-100'
        }`}
      >
        <RouterProvider router={router} />
      </div>
    </>
  );
}