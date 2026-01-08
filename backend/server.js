
const path = require('path');
const fs = require('fs');

// Verify .env existence for debugging
const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
  console.log('⚠️  WARNING: .env file not found in backend folder!');
}
require('dotenv').config({ path: envPath });

const express = require('express');
const fetch = require('node-fetch');
const { generateSalesInsights, performSentimentAnalysis } = require('./geminiService');

const app = express();
const PORT = 5001;

// ROBUST CORS & PRIVATE NETWORK HANDLING
app.use((req, res, next) => {
  const origin = req.headers.origin || '*';
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, X-Requested-With, Access-Control-Allow-Private-Network');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Private-Network', 'true');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

app.use(express.json());

// Enhanced Ping to report config status
app.get('/api/ping', (req, res) => {
  res.status(200).json({ 
    ok: true, 
    message: "Backend is reachable!",
    config: {
      geminiKey: !!process.env.API_KEY,
      vendastaKey: !!process.env.VENDASTA_API_KEY
    },
    timestamp: new Date().toISOString() 
  });
});

app.get('/api/metadata', async (req, res) => {
  try {
    const data = await getCrmData();
    const metadata = {
      teams: ['All', ...new Set(data.map(a => a.team))].filter(Boolean),
      aes: ['All', ...new Set(data.map(a => a.ae))].filter(Boolean),
      segments: ['All', ...new Set(data.map(a => a.segment))].filter(Boolean),
      tiers: ['All', ...new Set(data.map(a => a.tier.toString()))].sort()
    };
    res.json(metadata);
  } catch (error) {
    console.error("Metadata Error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

async function getCrmData() {
  const VEND_API_KEY = process.env.VENDASTA_API_KEY;
  const VEND_API_URL = 'https://api.vendasta.com/c-api/v1/accounts/search';
  
  if (!VEND_API_KEY) {
    console.log("ℹ️ No Vendasta API Key found - returning empty list.");
    return [];
  }

  try {
    const response = await fetch(VEND_API_URL, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${VEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ "limit": 250 })
    });
    
    if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Vendasta API Error (${response.status}): ${errText}`);
    }
    
    const rawData = await response.json();
    return transformVendastaData(rawData);
  } catch (error) {
    console.error('❌ CRM Data Fetch Failed:', error.message);
    throw error;
  }
}

function transformVendastaData(vendastaApiResponse) {
  const accounts = vendastaApiResponse.accounts || vendastaApiResponse.data || (Array.isArray(vendastaApiResponse) ? vendastaApiResponse : []);
  return accounts.map(account => ({
    id: account.account_id || account.id || Math.random().toString(),
    name: account.company_name || account.name || account.account_name || "Unknown Company",
    ae: account.salesperson_name || account.salesperson || 'Unassigned',
    team: account.sales_team || account.team_name || 'General',
    tier: account.tier !== undefined ? account.tier : '3',
    segment: account.market_segment || account.segment || 'Uncategorized',
    activities: (account.activities || []).map(act => ({
      id: act.activity_id || act.id || Math.random().toString(36).substr(2, 9),
      type: (act.type || '').toUpperCase() === 'CALL' ? 'meeting' : (act.type || '').toUpperCase() === 'EMAIL' ? 'email' : 'note',
      date: act.created_at || act.date || new Date().toISOString(),
      summary: act.subject || act.title || 'Activity Note',
      content: act.details || act.transcript || act.content || 'No content provided.',
    })),
  }));
}

app.post('/api/analyze', async (req, res) => {
  const { filters, question } = req.body;
  try {
    const allAccounts = await getCrmData();
    const [insight, sentiment] = await Promise.all([
      generateSalesInsights(allAccounts, question),
      performSentimentAnalysis(allAccounts)
    ]);
    res.json({ insight, sentiment });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n=========================================`);
  console.log(`🚀 SALES ANALYST SERVER RUNNING`);
  console.log(`=========================================`);
  console.log(`URL:         http://localhost:${PORT}`);
  console.log(`Gemini Key:  ${process.env.API_KEY ? '✅ CONFIGURED' : '❌ MISSING'}`);
  console.log(`Vendasta:    ${process.env.VENDASTA_API_KEY ? '✅ CONFIGURED' : '⚠️  NOT SET (Using Mock Data)'}`);
  console.log(`=========================================\n`);
});
