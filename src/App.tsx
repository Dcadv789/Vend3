import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import SACSimulation from './pages/SACSimulation';
import PriceSimulation from './pages/PriceSimulation';
import SimulationHistory from './pages/SimulationHistory';
import Comparison from './pages/Comparison';
import ProLabore from './pages/ProLabore';
import ProLaboreReport from './pages/ProLaboreReport';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<SACSimulation />} />
            <Route path="/price" element={<PriceSimulation />} />
            <Route path="/history" element={<SimulationHistory />} />
            <Route path="/comparison" element={<Comparison />} />
            <Route path="/pro-labore" element={<ProLabore />} />
            <Route path="/pro-labore-report" element={<ProLaboreReport />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;