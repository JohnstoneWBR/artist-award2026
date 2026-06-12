import React, { useState } from 'react';
import { Trophy, BarChart3, LayoutGrid } from 'lucide-react';

export default function Leaderboard({ nominees = [], categories = [] }) {
  const [filter, setFilter] = useState('all');

  // Filter and sort nominees
  const filteredNominees = filter === 'all'
    ? [...nominees]
    : nominees.filter(n => n.categoryId === filter);

  const sortedNominees = filteredNominees.sort((a, b) => b.voteCount - a.voteCount);

  // Find max vote count in filtered set for relative percentage bars
  const maxVotes = sortedNominees.length > 0 ? Math.max(...sortedNominees.map(n => n.voteCount)) : 0;

  const getCategoryName = (catId) => {
    const cat = categories.find(c => c.id === catId);
    return cat ? cat.name : catId;
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat().format(num);
  };

  return (
    <div className="leaderboard-container">
      <div className="section-header">
        <div className="section-title">
          Live Standings
          <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 400, marginTop: '4px' }}>
            Real-time rankings based on tips received.
          </span>
        </div>

        <div className="tabs-container">
          <button 
            className={`tab-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            <LayoutGrid size={14} className="tab-icon" />
            Overall
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              className={`tab-btn ${filter === cat.id ? 'active' : ''}`}
              onClick={() => setFilter(cat.id)}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {sortedNominees.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
          No nominations found in this category.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {sortedNominees.map((nominee, index) => {
            const rank = index + 1;
            const progressPercentage = maxVotes > 0 ? (nominee.voteCount / maxVotes) * 100 : 0;
            
            // Calculate rank name
            let rankClass = '';
            if (rank === 1) rankClass = 'rank-1';
            else if (rank === 2) rankClass = 'rank-2';
            else if (rank === 3) rankClass = 'rank-3';

            return (
              <div key={nominee.id} className="leaderboard-row">
                <div className={`rank-number ${rankClass}`}>
                  {rank === 1 && <Trophy size={18} style={{ color: '#ffd700', marginRight: '2px' }} />}
                  {rank !== 1 && rank}
                </div>
                
                <img src={nominee.image} alt={nominee.name} className="leaderboard-img" />
                
                <div className="leaderboard-meta">
                  <div className="leaderboard-name">{nominee.name}</div>
                  <div className="leaderboard-category">{getCategoryName(nominee.categoryId)}</div>
                </div>

                <div className="leaderboard-progress-container">
                  <div className="leaderboard-progress-bar">
                    <div 
                      className="leaderboard-progress-fill" 
                      style={{ width: `${progressPercentage}%` }}
                    ></div>
                  </div>
                  <div className="leaderboard-percent">
                    {progressPercentage.toFixed(0)}% of leader
                  </div>
                </div>

                <div className="leaderboard-votes">
                  {formatNumber(nominee.voteCount)}
                  <span>votes ({formatNumber(nominee.amountTipped)} KES)</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
