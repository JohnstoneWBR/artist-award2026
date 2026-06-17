import express from 'express';
import cors from 'cors';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import fsSync from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Custom inline dependency-free parser for .env
try {
  const envPath = path.join(__dirname, '../.env');
  if (fsSync.existsSync(envPath)) {
    const envFile = fsSync.readFileSync(envPath, 'utf8');
    envFile.split('\n').forEach(line => {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        const key = match[1];
        let val = match[2] || '';
        if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
        if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1);
        process.env[key] = val.trim();
      }
    });
  }
} catch (e) {
  console.warn('Warning: Could not load .env file', e);
}

const app = express();
const PORT = process.env.PORT || 5000;
const DATA_FILE = path.join(__dirname, 'data.json');

app.use(cors());
app.use(express.json());

// Helper function to read database
async function readDB() {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading database file:', error);
    return { categories: [], nominees: [], transactions: [] };
  }
}

// Helper function to write database
async function writeDB(data) {
  try {
    await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (error) {
    console.error('Error writing database file:', error);
  }
}

// Helper function to format M-Pesa phone number
function formatPhoneNumber(phone) {
  if (!phone) return '';
  let cleaned = phone.replace(/\D/g, ''); // Remove all non-digits
  if (cleaned.startsWith('0')) {
    cleaned = '254' + cleaned.substring(1);
  } else if (cleaned.startsWith('254')) {
    // already formatted
  } else if (cleaned.length === 9 && (cleaned.startsWith('7') || cleaned.startsWith('1'))) {
    cleaned = '254' + cleaned;
  }
  return cleaned;
}

// Route to fetch all voting data (categories, nominees, transactions, stats)
app.get('/api/data', async (req, res) => {
  const db = await readDB();
  
  // Calculate global stats
  const totalVotes = db.nominees.reduce((sum, n) => sum + (n.voteCount || 0), 0);
  const totalTipped = db.nominees.reduce((sum, n) => sum + (n.amountTipped || 0), 0);
  
  res.json({
    categories: db.categories,
    nominees: db.nominees,
    transactions: db.transactions.slice(0, 10), // return last 10 for the ticker
    stats: {
      totalVotes,
      totalTipped,
      nomineeCount: db.nominees.length
    }
  });
});

// Route to process a vote by triggering an M-Pesa STK push via IntaSend
app.post('/api/vote', async (req, res) => {
  const { nomineeId, amount, voterName, phoneNumber } = req.body;

  // Basic validations
  if (!nomineeId || !amount || !phoneNumber) {
    return res.status(400).json({ error: 'Missing required fields: nomineeId, amount, and phoneNumber are required.' });
  }

  const tipAmount = parseInt(amount, 10);
  if (isNaN(tipAmount) || tipAmount < 10) {
    return res.status(400).json({ error: 'Minimum tip amount is 10 KES (which equals 1 vote).' });
  }

  const formattedPhone = formatPhoneNumber(phoneNumber);
  if (!formattedPhone) {
    return res.status(400).json({ error: 'Invalid Safaricom phone number format.' });
  }

  const db = await readDB();
  const nominee = db.nominees.find(n => n.id === nomineeId);
  if (!nominee) {
    return res.status(404).json({ error: 'Nominee not found.' });
  }

  const token = process.env.INTASEND_SECRET_KEY;
  if (!token) {
    return res.status(500).json({ error: 'Server configuration error: missing IntaSend secret key.' });
  }

  try {
    // Call IntaSend M-Pesa STK Push API
    // Structuring metadata inside api_ref so we can access it on verification
    const apiRef = `v1|${nomineeId}|${encodeURIComponent(voterName || 'Anonymous Voter')}`;
    const intasendRes = await fetch('https://api.intasend.com/api/v1/payment/mpesa-stk-push/', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        amount: tipAmount.toString(),
        phone_number: formattedPhone,
        currency: 'KES',
        api_ref: apiRef
      })
    });

    const data = await intasendRes.json();
    if (!intasendRes.ok || !data.invoice) {
      console.error('IntaSend STK Push error response:', data);
      return res.status(400).json({ error: data.errors?.[0]?.message || data.detail || 'Failed to trigger M-Pesa STK Push via IntaSend.' });
    }

    res.json({
      success: true,
      invoiceId: data.invoice.invoice_id,
      status: 'PENDING',
      message: 'M-Pesa STK push initiated successfully. Please enter your PIN on your phone to complete payment.'
    });

  } catch (err) {
    console.error('Error during IntaSend STK Push initiation:', err);
    res.status(500).json({ error: 'Internal server error initiating payment.' });
  }
});

// Route to check payment status with IntaSend and update DB if complete
app.get('/api/vote/status/:invoiceId', async (req, res) => {
  const { invoiceId } = req.params;
  const token = process.env.INTASEND_SECRET_KEY;
  if (!token) {
    return res.status(500).json({ error: 'Server configuration error: missing IntaSend secret key.' });
  }

  try {
    const statusRes = await fetch('https://api.intasend.com/api/v1/payment/status/', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        invoice_id: invoiceId
      })
    });

    const data = await statusRes.json();
    if (!statusRes.ok || !data.invoice) {
      console.error('IntaSend check status error:', data);
      return res.status(400).json({ error: 'Failed to verify payment status with IntaSend.' });
    }

    const state = data.invoice.state; // 'PENDING', 'PROCESSING', 'COMPLETE', 'FAILED', 'CANCELED'

    if (state === 'COMPLETE') {
      const db = await readDB();
      
      // Check if this transaction has already been processed (prevent duplicate credit)
      const existingTx = db.transactions.find(tx => tx.id === invoiceId);
      if (existingTx) {
        const totalVotes = db.nominees.reduce((sum, n) => sum + (n.voteCount || 0), 0);
        const totalTipped = db.nominees.reduce((sum, n) => sum + (n.amountTipped || 0), 0);
        return res.json({
          success: true,
          status: 'COMPLETE',
          transaction: existingTx,
          nominees: db.nominees,
          stats: {
            totalVotes,
            totalTipped,
            nomineeCount: db.nominees.length
          }
        });
      }

      // Parse metadata from api_ref
      const apiRef = data.invoice.api_ref;
      let nomineeId = '';
      let voterName = 'Anonymous Voter';
      
      if (apiRef && apiRef.startsWith('v1|')) {
        const parts = apiRef.split('|');
        nomineeId = parts[1] || '';
        voterName = decodeURIComponent(parts[2] || 'Anonymous Voter');
      }

      const tipAmount = Math.floor(parseFloat(data.invoice.value));
      const votesEarned = Math.floor(tipAmount / 10);

      const nomineeIndex = db.nominees.findIndex(n => n.id === nomineeId);
      if (nomineeIndex === -1) {
        return res.status(404).json({ error: `Nominee with ID ${nomineeId} not found.` });
      }

      const nominee = db.nominees[nomineeIndex];
      nominee.voteCount = (nominee.voteCount || 0) + votesEarned;
      nominee.amountTipped = (nominee.amountTipped || 0) + tipAmount;

      const cleanVoterName = (voterName && voterName.trim()) ? voterName.trim() : 'Anonymous Voter';
      const newTransaction = {
        id: invoiceId,
        nomineeId,
        nomineeName: nominee.name,
        voterName: cleanVoterName,
        phoneNumber: data.invoice.account ? data.invoice.account.replace(/.(?=.{4})/g, '*') : '******',
        amount: tipAmount,
        votes: votesEarned,
        timestamp: data.invoice.updated_at || new Date().toISOString()
      };

      db.transactions.unshift(newTransaction);
      await writeDB(db);

      console.log(`Live payment confirmed! Cast ${votesEarned} votes for ${nominee.name} tipped by ${cleanVoterName}`);

      const totalVotes = db.nominees.reduce((sum, n) => sum + (n.voteCount || 0), 0);
      const totalTipped = db.nominees.reduce((sum, n) => sum + (n.amountTipped || 0), 0);

      return res.json({
        success: true,
        status: 'COMPLETE',
        transaction: newTransaction,
        nominees: db.nominees,
        stats: {
          totalVotes,
          totalTipped,
          nomineeCount: db.nominees.length
        }
      });
    } else if (state === 'FAILED' || state === 'CANCELED') {
      return res.json({
        success: false,
        status: state,
        error: data.invoice.failed_reason || 'Payment failed or was canceled.'
      });
    } else {
      // PENDING or PROCESSING
      return res.json({
        success: true,
        status: state
      });
    }

  } catch (err) {
    console.error('Error in status check endpoint:', err);
    return res.status(500).json({ error: 'Internal server error checking payment status.' });
  }
});

// Serve frontend static build in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

