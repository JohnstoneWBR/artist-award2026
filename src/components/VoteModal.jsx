import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, ShieldCheck, Loader2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { processLocalVote } from '../utils/mockBackend';

const getApiUrl = (path) => {
  const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  const base = isLocal ? 'http://localhost:5000' : '';
  return `${base}${path}`;
};

export default function VoteModal({ nominee, categoryName, onClose, onVoteSuccess }) {
  const [step, setStep] = useState(1); // 1: Form, 2: Simulated STK, 3: Success
  const [amount, setAmount] = useState('250');
  const [voterName, setVoterName] = useState('');
  const [phone, setPhone] = useState('');
  
  // Errors
  const [amountError, setAmountError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [txReceipt, setTxReceipt] = useState(null);

  // M-Pesa PIN dot simulation animation
  const [pinDots, setPinDots] = useState(0);

  useEffect(() => {
    let pinInterval;
    if (step === 2) {
      // Simulate typing PIN on phone screen
      setPinDots(0);
      pinInterval = setInterval(() => {
        setPinDots(prev => {
          if (prev >= 4) {
            clearInterval(pinInterval);
            return 4;
          }
          return prev + 1;
        });
      }, 400);
    }
    return () => clearInterval(pinInterval);
  }, [step]);

  const handlePresetClick = (val) => {
    setAmount(val.toString());
    setAmountError('');
  };

  const handleAmountChange = (e) => {
    const val = e.target.value;
    setAmount(val);
    if (parseInt(val, 10) < 50) {
      setAmountError('Minimum tip amount is 50 KES.');
    } else {
      setAmountError('');
    }
  };

  const handlePhoneChange = (e) => {
    const val = e.target.value;
    setPhone(val);
    // Simple Safaricom validation: 07xx, 01xx, 2547xx, 2541xx, +254xx
    const safRegex = /^(?:254|\+254|0)?(7|1)\d{8}$/;
    if (!val) {
      setPhoneError('Phone number is required.');
    } else if (!safRegex.test(val)) {
      setPhoneError('Enter a valid Safaricom number (e.g., 0712345678).');
    } else {
      setPhoneError('');
    }
  };

  const calculateVotes = () => {
    const amt = parseInt(amount, 10);
    if (isNaN(amt) || amt < 50) return 0;
    return Math.floor(amt / 50);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate amount
    const amt = parseInt(amount, 10);
    if (isNaN(amt) || amt < 50) {
      setAmountError('Minimum tip amount is 50 KES (1 vote).');
      return;
    }

    // Validate phone
    const safRegex = /^(?:254|\+254|0)?(7|1)\d{8}$/;
    if (!phone) {
      setPhoneError('Phone number is required.');
      return;
    } else if (!safRegex.test(phone)) {
      setPhoneError('Enter a valid Safaricom number.');
      return;
    }

    setIsSubmitting(true);
    setStep(2); // Move to STK push simulation

    try {
      const response = await fetch(getApiUrl('/api/vote'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nomineeId: nominee.id,
          amount: amt,
          voterName,
          phoneNumber: phone,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setTxReceipt(data.transaction);
        setStep(3); // Move to success step
        
        // Trigger confetti celebration!
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.55 },
          colors: ['#dfa725', '#f7e590', '#39b54a', '#ffffff']
        });

        // Notify parent to update core nominees state
        onVoteSuccess(data.nominees, data.stats, data.transaction);
      } else {
        alert(data.error || 'Voting failed. Please try again.');
        setStep(1);
      }
    } catch (err) {
      console.warn('Backend server not reachable. Processing vote in local storage simulation mode.', err);
      // Wait for STK Push phone animation to complete (1.5 seconds)
      setTimeout(() => {
        try {
          const data = processLocalVote(nominee.id, amt, voterName, phone);
          setTxReceipt(data.transaction);
          setStep(3); // Success state
          
          confetti({
            particleCount: 120,
            spread: 80,
            origin: { y: 0.55 },
            colors: ['#dfa725', '#f7e590', '#39b54a', '#ffffff']
          });

          onVoteSuccess(data.nominees, data.stats, data.transaction);
        } catch (localErr) {
          console.error(localErr);
          alert('Local vote processing failed.');
          setStep(1);
        }
      }, 1500);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2 className="modal-title">
            {step === 1 && 'Cast Your Tipped Vote'}
            {step === 2 && 'M-Pesa STK Push'}
            {step === 3 && 'Vote Successful!'}
          </h2>
          {step !== 2 && (
            <button className="modal-close-btn" onClick={onClose}>
              <X size={20} />
            </button>
          )}
        </div>

        <div className="modal-body">
          {/* Step 1: Voting Details Form */}
          {step === 1 && (
            <form onSubmit={handleSubmit}>
              <div className="nominee-preview">
                <img src={nominee.image} alt={nominee.name} className="nominee-preview-img" />
                <div>
                  <div className="nominee-preview-name">{nominee.name}</div>
                  <div className="nominee-preview-cat">{categoryName}</div>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Select Tip Amount (KES)</label>
                <div className="preset-grid">
                  {[50, 250, 500, 1000].map((val) => (
                    <button
                      key={val}
                      type="button"
                      className={`preset-btn ${amount === val.toString() ? 'active' : ''}`}
                      onClick={() => handlePresetClick(val)}
                    >
                      {val} KES
                    </button>
                  ))}
                </div>
                
                <div className="input-with-currency">
                  <span className="currency-addon">KES</span>
                  <input
                    type="number"
                    className="form-input"
                    value={amount}
                    onChange={handleAmountChange}
                    min="50"
                    placeholder="Enter custom amount"
                    required
                  />
                </div>
                {amountError && <span className="error-text">{amountError}</span>}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="voterName">Your Name (Optional)</label>
                <input
                  type="text"
                  id="voterName"
                  className="form-input no-addon"
                  value={voterName}
                  onChange={(e) => setVoterName(e.target.value)}
                  placeholder="e.g. Mwangi (defaults to Anonymous)"
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="phone">M-Pesa Phone Number</label>
                <input
                  type="tel"
                  id="phone"
                  className="form-input no-addon"
                  value={phone}
                  onChange={handlePhoneChange}
                  placeholder="e.g. 0712345678"
                  required
                />
                {phoneError && <span className="error-text">{phoneError}</span>}
              </div>

              <div className="vote-preview-box">
                <div className="vote-calc">
                  {calculateVotes()} <span>{calculateVotes() === 1 ? 'Vote' : 'Votes'}</span>
                </div>
                <div className="vote-rate">Calculated at 50 KES = 1 Vote</div>
              </div>

              <button type="submit" className="mpesa-pay-btn">
                Pay with M-Pesa KES {amount}
              </button>
            </form>
          )}

          {/* Step 2: STK Push Simulation Screen */}
          {step === 2 && (
            <div className="stk-simulation-wrap">
              <div className="pulse-ring"></div>
              
              <div className="mpesa-phone-mock">
                <div className="mpesa-push-dialog">
                  <div className="mpesa-logo-micro">M-PESA</div>
                  <div className="mpesa-push-title">Pay KWA MA BEAST BATTLE?</div>
                  <div className="mpesa-push-body">
                    Do you want to pay KES {amount}.00 to KWA MA BEAST BATTLE?
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div className="mpesa-pin-inputs">
                      {[1, 2, 3, 4].map(dot => (
                        <div 
                          key={dot} 
                          className={`pin-dot ${pinDots >= dot ? 'filled' : ''}`}
                        />
                      ))}
                    </div>
                    <span style={{ fontSize: '0.65rem', color: '#888' }}>Enter PIN</span>
                  </div>
                </div>
              </div>

              <div className="simulation-status">Sending STK Push...</div>
              <p className="simulation-desc">
                We've triggered an M-Pesa STK push to <strong>{phone}</strong>. Please check your phone screen, enter your M-Pesa PIN, and confirm.
              </p>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                <Loader2 size={16} className="spinner" />
                <span>Waiting for Safaricom authorization...</span>
              </div>
            </div>
          )}

          {/* Step 3: Success Screen */}
          {step === 3 && txReceipt && (
            <div className="success-screen">
              <div className="success-badge">
                <CheckCircle2 size={38} />
              </div>
              <h3 className="success-title">Payment Confirmed!</h3>
              <p className="success-desc">
                Your tip of KES {txReceipt.amount} has been processed. <strong>{txReceipt.votes} {txReceipt.votes === 1 ? 'vote' : 'votes'}</strong> have been credited to <strong>{txReceipt.nomineeName}</strong>!
              </p>

              <div className="transaction-receipt">
                <div className="receipt-row">
                  <span className="receipt-lbl">Receipt ID</span>
                  <span className="receipt-val">{txReceipt.id}</span>
                </div>
                <div className="receipt-row">
                  <span className="receipt-lbl">Artist Nominee</span>
                  <span className="receipt-val highlight">{txReceipt.nomineeName}</span>
                </div>
                <div className="receipt-row">
                  <span className="receipt-lbl">Voter Profile</span>
                  <span className="receipt-val">{txReceipt.voterName}</span>
                </div>
                <div className="receipt-row">
                  <span className="receipt-lbl">Amount Paid</span>
                  <span className="receipt-val">{txReceipt.amount} KES</span>
                </div>
                <div className="receipt-row">
                  <span className="receipt-lbl">Votes Issued</span>
                  <span className="receipt-val highlight">+{txReceipt.votes}</span>
                </div>
                <div className="receipt-row">
                  <span className="receipt-lbl">Timestamp</span>
                  <span className="receipt-val">{new Date(txReceipt.timestamp).toLocaleString()}</span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--mpesa-green)', fontSize: '0.75rem', marginTop: '4px' }}>
                <ShieldCheck size={14} />
                <span>Secure payment powered by M-Pesa Daraja</span>
              </div>

              <button className="close-done-btn" onClick={onClose}>
                Back to Dashboard
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
