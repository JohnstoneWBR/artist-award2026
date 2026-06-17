// ==========================================
   // CLIENT-SIDE MOCK BACKEND (localStorage fallback)
   // ==========================================

const SEED_CATEGORIES = [
  {
    "id": "cypher",
    "name": "Cypher",
    "description": "Top lyrical heavyweights, rappers, and vocalists battling for the crown."
  },
  {
    "id": "djs",
    "name": "DJs",
    "description": "Top deck masters keeping the crowd electrified."
  },
  {
    "id": "dance",
    "name": "Dance",
    "description": "Dynamic dancers and performers lighting up the stage."
  }
];

const SEED_NOMINEES = [
  {
    "id": "sauti-sol",
    "name": "Sauti Sol",
    "categoryId": "cypher",
    "bio": "Grammy-certified Afro-pop band known for their rich harmonies and global influence.",
    "image": "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=500&q=80",
    "voteCount": 1425,
    "amountTipped": 71250
  },
  {
    "id": "khaligraph",
    "name": "Khaligraph Jones",
    "categoryId": "cypher",
    "bio": "The OG. Leading hip-hop powerhouse known for fast flows and lyrical mastery.",
    "image": "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=500&q=80",
    "voteCount": 1105,
    "amountTipped": 55250
  },
  {
    "id": "nyashinski",
    "name": "Nyashinski",
    "categoryId": "cypher",
    "bio": "Multi-talented singer-songwriter whose comeback redefined Kenyan music.",
    "image": "https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?auto=format&fit=crop&w=500&q=80",
    "voteCount": 980,
    "amountTipped": 49000
  },
  {
    "id": "nadia-mukami",
    "name": "Nadia Mukami",
    "categoryId": "cypher",
    "bio": "African Pop Star award winner, known for her powerful vocals and hits.",
    "image": "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=500&q=80",
    "voteCount": 850,
    "amountTipped": 42500
  },
  {
    "id": "dj-joe-mfalme",
    "name": "DJ Joe Mfalme",
    "categoryId": "djs",
    "bio": "One of Kenya's most sought-after DJs, with a career spanning over a decade.",
    "image": "https://images.unsplash.com/photo-1571266028243-e4733b0f0bb1?auto=format&fit=crop&w=500&q=80",
    "voteCount": 1270,
    "amountTipped": 63500
  },
  {
    "id": "dj-sadic",
    "name": "DJ Sadic",
    "categoryId": "djs",
    "bio": "The 'Genius DJ' known for energetic gospel and crossover sets.",
    "image": "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=500&q=80",
    "voteCount": 810,
    "amountTipped": 40500
  },
  {
    "id": "dj-pierra-makena",
    "name": "DJ Pierra Makena",
    "categoryId": "djs",
    "bio": "Pioneering female DJ, actress, and event organizer championing Kenyan music.",
    "image": "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=500&q=80",
    "voteCount": 920,
    "amountTipped": 46000
  },
  {
    "id": "dj-fingerprint",
    "name": "DJ Fingerprint",
    "categoryId": "djs",
    "bio": "Renowned deck master and turntablist, celebrated for his high-octane club sets and creative live mashups.",
    "image": "https://images.unsplash.com/photo-1516873240891-4bf014598ab4?auto=format&fit=crop&w=500&q=80",
    "voteCount": 640,
    "amountTipped": 32000
  },
  {
    "id": "motif-di-don",
    "name": "Motif Di Don",
    "categoryId": "cypher",
    "bio": "Master beatmaker and executive producer behind major hip-hop and gengetone hits.",
    "image": "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=500&q=80",
    "voteCount": 750,
    "amountTipped": 37500
  },
  {
    "id": "cedo",
    "name": "Cedric Kadenyi (Cedo)",
    "categoryId": "cypher",
    "bio": "Award-winning sound designer and composer, key architect of the Sauti Sol sound.",
    "image": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=500&q=80",
    "voteCount": 680,
    "amountTipped": 34000
  },
  {
    "id": "magix-enga",
    "name": "Magix Enga",
    "categoryId": "cypher",
    "bio": "Self-proclaimed 'Beat King', known for high-octane rhythms and gengetone anthems.",
    "image": "https://images.unsplash.com/photo-1487180142328-0c4e37023af5?auto=format&fit=crop&w=500&q=80",
    "voteCount": 540,
    "amountTipped": 27000
  },
  {
    "id": "xbusy-kateya",
    "name": "Xbusy Kateya",
    "categoryId": "cypher",
    "bio": "Talented cypher lyricist and musician bringing fresh flows and energetic rhythm.",
    "image": "/xbusy.png",
    "voteCount": 0,
    "amountTipped": 0
  },
  {
    "id": "crazy-kennar",
    "name": "Crazy Kennar",
    "categoryId": "dance",
    "bio": "Renowned comedy content creator bringing humor and storytelling to millions.",
    "image": "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=500&q=80",
    "voteCount": 1650,
    "amountTipped": 82500
  },
  {
    "id": "azziad",
    "name": "Azziad Nasenya",
    "categoryId": "dance",
    "bio": "The TikTok sensation whose dance videos went viral worldwide, now a top media host.",
    "image": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=500&q=80",
    "voteCount": 1580,
    "amountTipped": 79000
  },
  {
    "id": "elsa-majimbo",
    "name": "Elsa Majimbo",
    "categoryId": "dance",
    "bio": "Sarcastic comedy creator who achieved massive global recognition during lockdowns.",
    "image": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=500&q=80",
    "voteCount": 1120,
    "amountTipped": 56000
  }
];

const SEED_TRANSACTIONS = [
  {
    "id": "tx-1781254834856-05lonpefq",
    "nomineeId": "dj-joe-mfalme",
    "nomineeName": "DJ Joe Mfalme",
    "voterName": "bravin",
    "phoneNumber": "******3959",
    "amount": 1000,
    "votes": 20,
    "timestamp": "2026-06-12T09:00:34.856Z"
  },
  {
    "id": "tx-1781254442120-z6ttcgi09",
    "nomineeId": "dj-joe-mfalme",
    "nomineeName": "DJ Joe Mfalme",
    "voterName": "Jane Doe",
    "phoneNumber": "******5678",
    "amount": 500,
    "votes": 10,
    "timestamp": "2026-06-12T08:54:02.120Z"
  },
  {
    "id": "tx-1",
    "nomineeId": "sauti-sol",
    "nomineeName": "Sauti Sol",
    "voterName": "Mwangi",
    "phoneNumber": "0712345678",
    "amount": 250,
    "votes": 5,
    "timestamp": "2026-06-12T11:00:00.000Z"
  }
];

export function initLocalStorage() {
  if (!localStorage.getItem('kava_nominees')) {
    localStorage.setItem('kava_categories', JSON.stringify(SEED_CATEGORIES));
    localStorage.setItem('kava_nominees', JSON.stringify(SEED_NOMINEES));
    localStorage.setItem('kava_transactions', JSON.stringify(SEED_TRANSACTIONS));
  }
}

export function getLocalData() {
  initLocalStorage();
  const categories = JSON.parse(localStorage.getItem('kava_categories'));
  const nominees = JSON.parse(localStorage.getItem('kava_nominees'));
  const transactions = JSON.parse(localStorage.getItem('kava_transactions'));

  const totalVotes = nominees.reduce((sum, n) => sum + (n.voteCount || 0), 0);
  const totalTipped = nominees.reduce((sum, n) => sum + (n.amountTipped || 0), 0);

  return {
    categories,
    nominees,
    transactions,
    stats: {
      totalVotes,
      totalTipped,
      nomineeCount: nominees.length
    }
  };
}

export function processLocalVote(nomineeId, amount, voterName, phoneNumber) {
  initLocalStorage();
  const nominees = JSON.parse(localStorage.getItem('kava_nominees'));
  const transactions = JSON.parse(localStorage.getItem('kava_transactions'));
  
  const nomineeIndex = nominees.findIndex(n => n.id === nomineeId);
  if (nomineeIndex === -1) {
    throw new Error('Nominee not found in client storage.');
  }

  const tipAmount = parseInt(amount, 10);
  const votesEarned = Math.floor(tipAmount / 10);

  const nominee = nominees[nomineeIndex];
  nominee.voteCount = (nominee.voteCount || 0) + votesEarned;
  nominee.amountTipped = (nominee.amountTipped || 0) + tipAmount;

  const cleanVoterName = (voterName && voterName.trim()) ? voterName.trim() : 'Anonymous Voter';
  const newTransaction = {
    id: `tx-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    nomineeId,
    nomineeName: nominee.name,
    voterName: cleanVoterName,
    phoneNumber: phoneNumber.replace(/.(?=.{4})/g, '*'), // Mask phone
    amount: tipAmount,
    votes: votesEarned,
    timestamp: new Date().toISOString()
  };

  transactions.unshift(newTransaction);

  localStorage.setItem('kava_nominees', JSON.stringify(nominees));
  localStorage.setItem('kava_transactions', JSON.stringify(transactions));

  const totalVotes = nominees.reduce((sum, n) => sum + (n.voteCount || 0), 0);
  const totalTipped = nominees.reduce((sum, n) => sum + (n.amountTipped || 0), 0);

  return {
    success: true,
    message: `Successfully processed ${votesEarned} votes locally.`,
    transaction: newTransaction,
    nominees,
    stats: {
      totalVotes,
      totalTipped,
      nomineeCount: nominees.length
    }
  };
}
