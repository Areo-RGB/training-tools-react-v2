import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Shared';
import Home from './features/Home';
import SoundCounter from './features/SoundCounter';
import Colors from './features/Colors';
import ChainCalculator from './features/ChainCalculator';
import Timers from './features/Timers';
import Interval from './features/Interval';
import Capitals from './features/Capitals';

const App: React.FC = () => {
  return (
    <HashRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/sound-counter" element={<SoundCounter />} />
          <Route path="/farben" element={<Colors />} />
          <Route path="/kettenrechner" element={<ChainCalculator />} />
          <Route path="/timers" element={<Timers />} />
          <Route path="/intervall" element={<Interval />} />
          <Route path="/capitals" element={<Capitals />} />
        </Routes>
      </Layout>
    </HashRouter>
  );
};

export default App;