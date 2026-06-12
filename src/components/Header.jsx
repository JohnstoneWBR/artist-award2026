import React, { useState, useEffect } from 'react';
import { Award, Compass } from 'lucide-react';

// Custom inline SVG social icons since brand icons are removed in recent lucide versions
const TwitterIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

const InstagramIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);

const YoutubeIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path>
    <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon>
  </svg>
);

export default function Header() {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    // Target date: June 28, 2026 at 18:00:00 (EAT, UTC+3)
    const targetDate = new Date('2026-06-28T18:00:00+03:00').getTime();

    const updateTimer = () => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference <= 0) {
        setTimeLeft('LIVE NOW');
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`);
    };

    updateTimer();
    const timerId = setInterval(updateTimer, 1000);

    return () => clearInterval(timerId);
  }, []);

  return (
    <header className="header-container">
      <div className="header-wrapper">
        <div className="logo">
          <Award className="logo-icon" size={28} />
          <span className="logo-text">KAVA 2026</span>
        </div>

        <div className="countdown-box">
          <span className="countdown-label">Voting Closes In:</span>
          <span className="countdown-timer">{timeLeft}</span>
        </div>

        <div className="social-links">
          <a href="https://twitter.com/kava2026" target="_blank" rel="noopener noreferrer" className="social-icon" title="Follow on X (Twitter)">
            <TwitterIcon size={20} />
          </a>
          <a href="https://instagram.com/kava2026" target="_blank" rel="noopener noreferrer" className="social-icon" title="Follow on Instagram">
            <InstagramIcon size={20} />
          </a>
          <a href="https://youtube.com/kava2026" target="_blank" rel="noopener noreferrer" className="social-icon" title="Subscribe on YouTube">
            <YoutubeIcon size={20} />
          </a>
          <a href="https://tiktok.com/@kava2026" target="_blank" rel="noopener noreferrer" className="social-icon" title="Follow on TikTok">
            <Compass size={20} />
          </a>
        </div>
      </div>
    </header>
  );
}
