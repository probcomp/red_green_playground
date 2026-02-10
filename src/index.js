import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';
import App from './App';
import JTAPResultsPage from './components/JTAPResultsPage';
import Cogsci2025TunedPage from './components/Cogsci2025TunedPage';
import TrialByTrialPage from './components/TrialByTrialPage';
import AggregatedResultsPage from './components/AggregatedResultsPage';
import CandidateTrialsPage from './components/CandidateTrialsPage';
import DiameterTrialByTrialPage from './components/DiameterTrialByTrialPage';
import DiameterAggregatedPage from './components/DiameterAggregatedPage';
import CardinalDirectionAnalysisPage from './components/CardinalDirectionAnalysisPage';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/jtap" element={<JTAPResultsPage />} />
        <Route path="/jtap/cogsci2025-tuned" element={<Cogsci2025TunedPage />} />
        <Route path="/jtap/cogsci2025-tuned/trial-by-trial" element={<TrialByTrialPage />} />
        <Route path="/jtap/cogsci2025-tuned/aggregated" element={<AggregatedResultsPage />} />
        <Route path="/jtap/candidate-trials" element={<CandidateTrialsPage />} />
        <Route path="/jtap/diameter/:diameter/trial-by-trial" element={<DiameterTrialByTrialPage />} />
        <Route path="/jtap/diameter/:diameter/aggregated" element={<DiameterAggregatedPage />} />
        <Route path="/jtap/cardinal-direction-analysis" element={<CardinalDirectionAnalysisPage />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
