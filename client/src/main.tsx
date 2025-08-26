import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { HelmetProvider } from 'react-helmet-async';

import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { ReducedMotionProvider } from '@/components/providers/ReducedMotionProvider';
import App from './App';
import './styles/globals.css';

// React Query configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
    },
    mutations: {
      retry: 1,
    },
  },
});

// Helmet configuration
const helmetContext = {};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HelmetProvider context={helmetContext}>
      <ReducedMotionProvider>
        <ThemeProvider defaultMode="dark" defaultPalette="teal">
          <QueryClientProvider client={queryClient}>
            <BrowserRouter>
              <App />
            </BrowserRouter>
            {/* React Query Devtools - only in development */}
            {import.meta.env.DEV && (
              <ReactQueryDevtools
                initialIsOpen={false}
                position="bottom-right"
              />
            )}
          </QueryClientProvider>
        </ThemeProvider>
      </ReducedMotionProvider>
    </HelmetProvider>
  </React.StrictMode>
);
