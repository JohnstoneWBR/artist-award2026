import React from 'react';
import { Flame, Trophy } from 'lucide-react';

export default function NomineeCard({ nominee, allNominees = [], categories = [], onVoteClick }) {
  // Find category name
  const category = categories.find(cat => cat.id === nominee.categoryId);
  const categoryName = category ? category.name : nominee.categoryId;

  // Calculate ranking within category
  const siblingNominees = allNominees.filter(n => n.categoryId === nominee.categoryId);
  const sortedSiblings = [...siblingNominees].sort((a, b) => b.voteCount - a.voteCount);
  const rank = sortedSiblings.findIndex(n => n.id === nominee.id) + 1;

  // Calculate percentage of votes in this category
  const totalCategoryVotes = siblingNominees.reduce((sum, n) => sum + n.voteCount, 0);
  const percentage = totalCategoryVotes > 0 
    ? ((nominee.voteCount / totalCategoryVotes) * 100).toFixed(1)
    : '0.0';

  const formatNumber = (num) => {
    return new Intl.NumberFormat().format(num);
  };

  const getRankOrdinal = (r) => {
    if (r === 1) return '1st Place';
    if (r === 2) return '2nd Place';
    if (r === 3) return '3rd Place';
    return `#${r} in Category`;
  };

  return (
    <div className="nominee-card">
      <span className="card-badge">{categoryName}</span>
      <div className="nominee-img-wrap">
        <img 
          src={nominee.image} 
          alt={nominee.name} 
          className="nominee-img" 
          loading="lazy"
        />
        <div className="nominee-overlay"></div>
      </div>

      <div className="nominee-info">
        <div className="nominee-rank">
          <Trophy size={12} style={{ display: 'inline', marginRight: '4px', transform: 'translateY(-1px)' }} />
          {getRankOrdinal(rank)}
        </div>
        <h3 className="nominee-name">{nominee.name}</h3>
        <p className="nominee-bio" title={nominee.bio}>{nominee.bio}</p>

        <div className="votes-display">
          <div className="votes-count">
            {formatNumber(nominee.voteCount)}
            <span>votes</span>
          </div>
          <div className="votes-percentage">
            {percentage}%
          </div>
        </div>

        <button 
          className="vote-btn"
          onClick={() => onVoteClick(nominee)}
        >
          <Flame size={16} />
          Vote / Tip
        </button>
      </div>
    </div>
  );
}
