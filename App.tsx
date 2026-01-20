import React, { lazy, Suspense } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Shared';
import { PWAUpdatePrompt } from './components/PWAUpdatePrompt';
import Home from './features/Home';

// Lazy-load feature components for better code splitting

const Colors = lazy(() => import('./features/Colors'));
const ChainCalculator = lazy(() => import('./features/ChainCalculator'));


const App: React.FC = () => {
  return (
    <HashRouter>
      <Layout>
        <Suspense fallback={
          <div className="flex items-center justify-center min-h-[50vh]">
            <div className="text-center">
              <div className="inline-block w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-textSecondary font-medium">Lädt...</p>
            </div>
          </div>
        }>
          <Routes>
            <Route path="/" element={<Home />} />

            <Route path="/farben" element={<Colors />} />
            <Route path="/kettenrechner" element={<ChainCalculator />} />

          </Routes>
        </Suspense>
        <PWAUpdatePrompt />
      </Layout>
    </HashRouter>
  );
};

export default App;