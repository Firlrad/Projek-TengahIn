import React, { useEffect, useState } from 'react';
import LandingPage from './components/LandingPage';
import Workspace from './components/Workspace';
import { checkHealth } from './services/api';

export default function App() {
  const [view, setView] = useState('landing'); // 'landing' | 'workspace'
  const [backendStatus, setBackendStatus] = useState('checking...');

  useEffect(() => {
    checkHealth()
      .then((data) => setBackendStatus(data.status || 'connected'))
      .catch(() => setBackendStatus('offline (jalankan backend di port 8000)'));
  }, []);

  const handleGoToWorkspace = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setView('workspace');
  };

  const handleGoToLanding = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setView('landing');
  };

  if (view === 'landing') {
    return <LandingPage onStartSearching={handleGoToWorkspace} />;
  }

  return (
    <Workspace
      onBackToHome={handleGoToLanding}
      backendStatus={backendStatus}
    />
  );
}
