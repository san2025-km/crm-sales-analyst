// Use CommonJS require syntax for Node.js server
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const { generateSalesInsights, performSentimentAnalysis } = require('./geminiService');

const app = express();
const PORT = 3001;

// --- Middleware ---
// Enable CORS for all requests to allow the frontend to communicate with this server
app.use(cors());
// Enable parsing of JSON request bodies
app.use(express.json());

// --- Data Transformation Layer ---
/**
 * ACTION REQUIRED: This is the most critical function to implement.
 * It takes the raw JSON response from the Vendasta API and transforms it
 * into the structured array of 'Account' objects that the rest of the application expects.
 *
 * @param {any} vendastaApiResponse The raw JSON data from the Vendasta API.
 * @returns {Array<import("../types").Account>} An array of accounts with their activities.
 */
function transformVendastaData(vendastaApiResponse) {
  // You need to inspect the actual data from Vendasta and map it here.
  // The goal is to return an array of objects matching the `Account` interface in `types.ts`.
  //
  // EXAMPLE PSEUDOCODE:
  /*
  const accounts = vendastaApiResponse.data.accounts.map(account => ({
    id: account.accountId,
    name: account.companyName,
    ae: account.accountExecutiveName,
    team: account.salesTeam,
    activities: vendastaApiResponse.data.activities
      .filter(act => act.accountId === account.accountId)
      .map(act => ({
        id: act.activityId,
        type: act.activityType, // 'note', 'email', or 'meeting'
        date: act.date,
        summary: act.subject,
        content: act.details || act.transcript,
      })),
  }));
  return accounts;
  */

  // For now, return an empty array to prevent crashes.
  // The app will report that no data was found until this is implemented.
  console.warn("WARN: `transformVendastaData` function is not implemented. Using empty data set.");
  return [];
}


// --- Integration Layer ---
/**
 * Fetches all relevant data from the Vendasta CRM API.
 */
async function getCrmData() {
  const VEND_API_KEY = process.env.VENDASTA_API_KEY;
  
  // ACTION REQUIRED: Replace this with the actual Vendasta API endpoint.
  const VEND_API_URL = 'https://api.vendasta.com/v2/your-endpoint-here';

  if (!VEND_API_KEY) {
    throw new Error('Vendasta API key is not configured on the server.');
  }

  try {
    const response = await fetch(VEND_API_URL, {
      method: 'GET',
      headers: {
        // This might be 'Bearer', 'Basic', or a custom header like 'X-API-Key'.
        // Check the Vendasta API documentation.
        'Authorization': `Bearer ${VEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      // Provide a more helpful error message
      const errorBody = await response.text();
      console.error("Vendasta API Error Body:", errorBody);
      throw new Error(`Vendasta API responded with status ${response.status}.`);
    }

    const rawData = await response.json();
    return transformVendastaData(rawData);
  } catch (error) {
    console.error('Error fetching or transforming data from Vendasta:', error);
    // Re-throw the error to be caught by the API controller
    throw new Error('Failed to retrieve or process data from the Vendasta API.');
  }
}

// --- API / Controller Layer ---
app.post('/api/analyze', async (req, res) => {
  const { filters, question } = req.body;

  // Basic input validation
  if (!filters || !question) {
    return res.status(400).json({ error: 'Missing filters or question in the request body.' });
  }

  try {
    // 1. Fetch all data from the CRM
    const allAccounts = await getCrmData();

    // 2. Service/Business Logic Layer: Perform filtering on the server
    const filteredAccounts = allAccounts.filter(account => {
      const teamMatch = filters.team === 'All' || account.team === filters.team;
      const aeMatch = filters.ae === 'All' || account.ae === filters.ae;
      const dateMatch = account.activities.some(act =>
        new Date(act.date) >= new Date(filters.startDate) && new Date(act.date) <= new Date(filters.endDate)
      );
      return teamMatch && aeMatch && dateMatch;
    });

    const accountsWithFilteredActivities = filteredAccounts.map(account => ({
      ...account,
      activities: account.activities.filter(act =>
        new Date(act.date) >= new Date(filters.startDate) && new Date(act.date) <= new Date(filters.endDate)
      )
    })).filter(account => account.activities.length > 0);

    // 3. Perform AI analysis using the filtered data
    const [insight, sentiment] = await Promise.all([
      generateSalesInsights(accountsWithFilteredActivities, question),
      performSentimentAnalysis(accountsWithFilteredActivities)
    ]);
    
    // 4. Send the computed result to the UI
    res.json({ insight, sentiment });

  } catch (error) {
    console.error('[API /api/analyze] Error:', error);
    res.status(500).json({ error: error.message || 'An internal server error occurred.' });
  }
});


// --- Server Initialization ---
app.listen(PORT, () => {
  console.log(`Backend server is running on http://localhost:${PORT}`);
});