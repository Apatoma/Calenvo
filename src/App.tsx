import { useState, useEffect } from 'react';
import { useAuth } from './contexts/AuthContext';
import { LandingPage } from './components/LandingPage';
import { AuthModal } from './components/AuthModal';
import { Dashboard } from './components/Dashboard';
import { BookingPage } from './components/BookingPage';

type View = 'landing' | 'dashboard' | 'booking';

function App() {
  const { user, loading } = useAuth();
  const [view, setView] = useState<View>('landing');
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'signup'>('signin');
  const [bookingUrl, setBookingUrl] = useState('');

  useEffect(() => {
    const path = window.location.pathname;

    if (path.startsWith('/book/')) {
      const url = path.replace('/book/', '');
      setBookingUrl(url);
      setView('booking');
    } else if (user && path === '/dashboard') {
      setView('dashboard');
    } else if (user) {
      setView('dashboard');
      window.history.pushState({}, '', '/dashboard');
    } else {
      setView('landing');
      window.history.pushState({}, '', '/');
    }
  }, [user]);

  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;

      if (path.startsWith('/book/')) {
        const url = path.replace('/book/', '');
        setBookingUrl(url);
        setView('booking');
      } else if (path === '/dashboard' && user) {
        setView('dashboard');
      } else {
        setView('landing');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [user]);

  const handleGetStarted = () => {
    setAuthModalMode('signup');
    setAuthModalOpen(true);
  };

  const handleSignIn = () => {
    setAuthModalMode('signin');
    setAuthModalOpen(true);
  };

  const handleBackToLanding = () => {
    setView('landing');
    window.history.pushState({}, '', '/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <>
      {view === 'landing' && (
        <LandingPage onGetStarted={handleGetStarted} onSignIn={handleSignIn} />
      )}

      {view === 'dashboard' && user && <Dashboard />}

      {view === 'booking' && (
        <BookingPage bookingUrl={bookingUrl} onBack={handleBackToLanding} />
      )}

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authModalMode}
      />
    </>
  );
}

export default App;
