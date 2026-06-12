import React from 'react';
import { Sparkles, Flame, Users, Wallet } from 'lucide-react';

export default function Hero({ stats = { totalVotes: 0, totalTipped: 0, nomineeCount: 0 } }) {
  // Format numbers nicely
  const formatNumber = (num) => {
    return new Intl.NumberFormat().format(num);
  };

  return (
    <section className="hero">
      <div className="hero-subtitle">
        <Sparkles size={14} style={{ display: 'inline', marginRight: '6px', transform: 'translateY(-1px)' }} />
        June 28, 2026
      </div>
      <h1 className="hero-title">
        Kenyan Artists<br />
        <span>Voting Awards 2026</span>
      </h1>
      <p className="hero-desc">
        Celebrate and empower Kenya's creative geniuses. Support your favorite musicians, DJs, producers, and creators through tipped votes. Every <strong>50 KES</strong> tipped awards <strong>1 Vote</strong> directly to the artist.
      </p>

      <div className="stats-grid">
        <div className="stat-card">
          <Flame className="stat-card-icon" size={24} />
          <div className="stat-val">{formatNumber(stats.totalVotes)}</div>
          <div className="stat-lbl">Total Votes Cast</div>
        </div>
        
        <div className="stat-card">
          <Wallet className="stat-card-icon" size={24} />
          <div className="stat-val">{formatNumber(stats.totalTipped)} KES</div>
          <div className="stat-lbl">Tips Contributed</div>
        </div>

        <div className="stat-card">
          <Users className="stat-card-icon" size={24} />
          <div className="stat-val">{stats.nomineeCount}</div>
          <div className="stat-lbl">Competing Artists</div>
        </div>
      </div>
    </section>
  );
}
