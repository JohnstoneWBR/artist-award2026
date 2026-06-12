import express from 'express';
import cors from 'cors';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

// Route to process a vote with simulated M-Pesa STK push
app.post('/api/vote', async (req, res) => {
  const { nomineeId, amount, voterName, phoneNumber } = req.body;

  // Basic validations
  if (!nomineeId || !amount || !phoneNumber) {
    return res.status(400).json({ error: 'Missing required fields: nomineeId, amount, and phoneNumber are required.' });
  }

  const tipAmount = parseInt(amount, 10);
  if (isNaN(tipAmount) || tipAmount < 50) {
    return res.status(400).json({ error: 'Minimum tip amount is 50 KES (which equals 1 vote).' });
  }

  const votesEarned = Math.floor(tipAmount / 50);
  const db = await readDB();
  const nomineeIndex = db.nominees.findIndex(n => n.id === nomineeId);

  if (nomineeIndex === -1) {
    return res.status(404).json({ error: 'Nominee not found.' });
  }

  // Simulate M-Pesa STK Push latency (2 seconds)
  setTimeout(async () => {
    try {
      const liveDb = await readDB(); // Re-read to prevent overwriting other concurrent writes
      const liveNomineeIndex = liveDb.nominees.findIndex(n => n.id === nomineeId);
      
      if (liveNomineeIndex === -1) {
        return res.status(404).json({ error: 'Nominee not found during transaction.' });
      }

      const nominee = liveDb.nominees[liveNomineeIndex];
      nominee.voteCount = (nominee.voteCount || 0) + votesEarned;
      nominee.amountTipped = (nominee.amountTipped || 0) + tipAmount;

      const cleanVoterName = (voterName && voterName.trim()) ? voterName.trim() : 'Anonymous Voter';
      const newTransaction = {
        id: `tx-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        nomineeId,
        nomineeName: nominee.name,
        voterName: cleanVoterName,
        phoneNumber: phoneNumber.replace(/.(?=.{4})/g, '*'), // Mask phone for privacy
        amount: tipAmount,
        votes: votesEarned,
        timestamp: new Date().toISOString()
      };

      // Insert at the beginning of the transaction logs
      liveDb.transactions.unshift(newTransaction);

      await writeDB(liveDb);

      console.log(`Successfully cast ${votesEarned} votes for ${nominee.name} tipped by ${cleanVoterName}`);

      // Calculate new global stats
      const totalVotes = liveDb.nominees.reduce((sum, n) => sum + (n.voteCount || 0), 0);
      const totalTipped = liveDb.nominees.reduce((sum, n) => sum + (n.amountTipped || 0), 0);

      res.json({
        success: true,
        message: `Successfully processed ${votesEarned} votes for ${nominee.name}.`,
        transaction: newTransaction,
        nominees: liveDb.nominees,
        stats: {
          totalVotes,
          totalTipped,
          nomineeCount: liveDb.nominees.length
        }
      });
    } catch (err) {
      console.error('Error during payment processing simulation:', err);
      res.status(500).json({ error: 'Internal server error processing payment.' });
    }
  }, 2000);
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
