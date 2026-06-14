import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Ticker from './components/Ticker';
import Hero from './components/Hero';
import CategoryTabs from './components/CategoryTabs';
import NomineeCard from './components/NomineeCard';
import Leaderboard from './components/Leaderboard';
import VoteModal from './components/VoteModal';
import { Award, Share2, Flame, RefreshCw, Trophy, Users, X, Info } from 'lucide-react';
import { getLocalData } from './utils/mockBackend';

const getApiUrl = (path) => {
  const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  const base = isLocal ? 'http://localhost:5000' : '';
  return `${base}${path}`;
};

export default function App() {
  const [activeTab, setActiveTab] = useState('vote'); // 'vote' or 'leaderboard'
  const [categories, setCategories] = useState([]);
  const [nominees, setNominees] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState({ totalVotes: 0, totalTipped: 0, nomineeCount: 0 });
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [selectedNominee, setSelectedNominee] = useState(null);
  
  // Toast notifications
  const [toasts, setToasts] = useState([]);

  // Simulated Safaricom M-Pesa SMS alerts
  const [activeSMS, setActiveSMS] = useState(null);

  const addToast = (message, type = 'success') => {
    const id = Date.now() + Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Fetch data from backend
  const fetchData = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await fetch(getApiUrl('/api/data'));
      const data = await res.json();
      
      setCategories(data.categories);
      setNominees(data.nominees);
      setTransactions(data.transactions);
      setStats(data.stats);
      
      return data;
    } catch (err) {
      console.warn('Backend server not reachable. Falling back to local storage simulation.', err);
      
      const localData = getLocalData();
      setCategories(localData.categories);
      setNominees(localData.nominees);
      setTransactions(localData.transactions);
      setStats(localData.stats);
      
      return localData;
    } finally {
      if (!silent) setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    const init = async () => {
      const data = await fetchData();
      
      // Handle social media deep link (e.g. ?artist=sauti-sol)
      if (data && data.nominees) {
        const params = new URLSearchParams(window.location.search);
        const artistId = params.get('artist') || params.get('vote');
        if (artistId) {
          const nominee = data.nominees.find(n => n.id === artistId);
          if (nominee) {
            setSelectedNominee(nominee);
            addToast(`Direct link loaded: Vote for ${nominee.name}!`);
          }
        }
      }
    };
    init();

    // Poll for updates every 10 seconds to keep stats and leaderboard live
    const interval = setInterval(() => {
      fetchData(true);
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const handleVoteSuccess = (updatedNominees, updatedStats, newTx) => {
    setNominees(updatedNominees);
    setStats(updatedStats);
    // Insert new transaction at front
    setTransactions(prev => [newTx, ...prev].slice(0, 10));
    
    // Add real-time notification
    addToast(`Thank you! Cast ${newTx.votes} votes for ${newTx.nomineeName}! 🎉`);

    // Simulate mobile M-Pesa Safaricom SMS text notification
    const randomBalanceVal = (Math.random() * 12000 + 3500).toFixed(2);
    const mockBalance = new Intl.NumberFormat().format(randomBalanceVal);
    const mockTxCode = newTx.id.split('-')[1]?.toUpperCase() || 'KF82LS73K';

    setActiveSMS({
      txId: mockTxCode,
      amount: newTx.amount,
      nomineeName: newTx.nomineeName,
      balance: mockBalance
    });

    // Clear SMS after 8 seconds
    setTimeout(() => {
      setActiveSMS(null);
    }, 8000);
  };

  const copyShareLink = (nominee, e) => {
    e.stopPropagation();
    const shareUrl = `${window.location.origin}${window.location.pathname}?artist=${nominee.id}`;
    navigator.clipboard.writeText(shareUrl)
      .then(() => {
        addToast(`Share link for ${nominee.name} copied to clipboard! 📋`);
      })
      .catch(() => {
        addToast('Failed to copy share link.', 'error');
      });
  };

  // Filter nominees by tab category
  const displayedNominees = selectedCategory === 'all'
    ? nominees
    : nominees.filter(n => n.categoryId === selectedCategory);

  return (
    <div className="app-container">
      {/* Real-time Scrolling Ticker */}
      <Ticker transactions={transactions} />

      {/* Header with Countdown & Socials */}
      <Header />

      {/* Global Toast Alerts */}
      <div className="toast-container">
        {toasts.map(toast => (
          <div key={toast.id} className={`toast ${toast.type === 'error' ? 'toast-error' : 'toast-success'}`}>
            <div className="toast-message">{toast.message}</div>
            <button className="toast-close" onClick={() => removeToast(toast.id)}>
              <X size={14} />
            </button>
          </div>
        ))}
      </div>

      <main className="main-content">
        {/* Hero Banner with Stats */}
        <Hero stats={stats} />

        {/* Tab Navigation (Vote vs Standings) */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', margin: '2rem 0 3rem 0' }}>
          <button 
            className={`tab-btn ${activeTab === 'vote' ? 'active' : ''}`}
            onClick={() => setActiveTab('vote')}
            style={{ padding: '0.8rem 1.8rem', borderRadius: '30px' }}
          >
            <Users size={16} />
            Nominees
          </button>
          <button 
            className={`tab-btn ${activeTab === 'leaderboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('leaderboard')}
            style={{ padding: '0.8rem 1.8rem', borderRadius: '30px' }}
          >
            <Trophy size={16} />
            Leaderboard
          </button>
          <button 
            className="tab-btn"
            onClick={() => fetchData(false)}
            title="Refresh Live Data"
            style={{ padding: '0.8rem' }}
          >
            <RefreshCw size={16} />
          </button>
        </div>

        {loading ? (
          <div className="loading-overlay">
            <div className="spinner"></div>
            <div style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Fetching live entries...</div>
          </div>
        ) : (
          <>
            {/* Tab 1: Voting Directory */}
            {activeTab === 'vote' && (
              <>
                <CategoryTabs 
                  categories={categories}
                  selectedCategory={selectedCategory}
                  onSelectCategory={setSelectedCategory}
                />
                
                {displayedNominees.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-muted)' }}>
                    No nominees found in this category.
                  </div>
                ) : (
                  <div className="nominees-grid">
                    {displayedNominees.map(nominee => (
                      <div key={nominee.id} style={{ position: 'relative' }}>
                        {/* Share link button overlayed on card header */}
                        <button 
                          className="preset-btn"
                          onClick={(e) => copyShareLink(nominee, e)}
                          title="Copy Social Share Link"
                          style={{
                            position: 'absolute',
                            top: '1rem',
                            right: '1rem',
                            zIndex: 10,
                            padding: '0.35rem 0.6rem',
                            borderRadius: '30px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            background: 'rgba(0, 0, 0, 0.7)',
                            border: '1px solid var(--border-color)',
                            fontSize: '0.7rem'
                          }}
                        >
                          <Share2 size={12} />
                          Share
                        </button>
                        
                        <NomineeCard 
                          nominee={nominee}
                          allNominees={nominees}
                          categories={categories}
                          onVoteClick={setSelectedNominee}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* Tab 2: Standings / Leaderboard */}
            {activeTab === 'leaderboard' && (
              <Leaderboard 
                nominees={nominees}
                categories={categories}
              />
            )}
          </>
        )}
      </main>

      {/* Info Banner at Footer */}
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', padding: '1rem', background: 'rgba(255, 255, 255, 0.02)', borderTop: '1px solid var(--border-color)' }}>
        <Info size={14} style={{ color: 'var(--gold-primary)' }} />
        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          Tip safely via M-Pesa. Standard operator charges apply. 50 KES = 1 Vote.
        </span>
      </div>

      {/* Footer */}
      <footer className="footer-container">
        <div className="footer-wrapper">
          <div className="footer-brand">
            <div className="logo">
              <Award className="logo-icon" size={24} />
              <span className="logo-text">KWA MA BEAST BATTLE</span>
            </div>
            <p className="footer-desc">
              KWA MA BEAST BATTLE. Empowering creators and celebrating our cultural pioneers.
            </p>
          </div>

          <div className="footer-meta">
            &copy; 2026 KWA MA BEAST BATTLE. All Rights Reserved.
          </div>
        </div>
      </footer>

      {/* Checkout Modal overlay */}
      {selectedNominee && (
        <VoteModal 
          nominee={selectedNominee}
          categoryName={categories.find(c => c.id === selectedNominee.categoryId)?.name || selectedNominee.categoryId}
          onClose={() => {
            setSelectedNominee(null);
            // Clear URL search params after closing direct link
            const url = new URL(window.location);
            url.searchParams.delete('artist');
            url.searchParams.delete('vote');
            window.history.pushState({}, '', url);
          }}
          onVoteSuccess={handleVoteSuccess}
        />
      )}

      {/* Safaricom M-Pesa Mock SMS Notification Panel */}
      <div className={`sms-notification ${activeSMS ? 'show' : ''}`}>
        <div className="sms-header">
          <span className="sms-brand">M-PESA</span>
          <span className="sms-time">now</span>
        </div>
        <div className="sms-body">
          {activeSMS && (
            <>
              <strong>{activeSMS.txId}</strong> Confirmed. Ksh<strong>{activeSMS.amount}.00</strong> sent to <strong>KWA MA BEAST BATTLE</strong> for <strong>{activeSMS.nomineeName}</strong>. New M-PESA balance is KSh <strong>{activeSMS.balance}</strong>. Transaction cost KSh 0.00.
            </>
          )}
        </div>
        <div className="sms-swipe-indicator" onClick={() => setActiveSMS(null)} title="Dismiss"></div>
      </div>
    </div>
  );
}
