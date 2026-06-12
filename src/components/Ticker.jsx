import React from 'react';
import { Flame } from 'lucide-react';

export default function Ticker({ transactions = [] }) {
  if (transactions.length === 0) {
    return (
      <div className="ticker-wrap">
        <div className="ticker-title">LIVE VOTE TICKER</div>
        <div className="ticker">
          <div className="ticker-item">Be the first to vote for your favorite artist! 50 KES = 1 Vote.</div>
        </div>
      </div>
    );
  }

  // Duplicate items to ensure smooth scrolling animation without gaps
  const displayTx = [...transactions, ...transactions, ...transactions];

  return (
    <div className="ticker-wrap">
      <div className="ticker-title">LIVE UPDATES</div>
      <div className="ticker">
        {displayTx.map((tx, idx) => (
          <div key={`${tx.id}-${idx}`} className="ticker-item">
            <Flame size={14} style={{ marginRight: '6px', color: '#dfa725' }} />
            <span>{tx.voterName}</span>
            <span> voted for </span>
            <strong>{tx.nomineeName}</strong>
            <span> by tipping </span>
            <span className="ticker-votes">{tx.amount} KES</span>
            <strong>({tx.votes} {tx.votes === 1 ? 'vote' : 'votes'})</strong>
          </div>
        ))}
      </div>
    </div>
  );
}
