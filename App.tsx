
import React, { useState, useMemo } from 'react';
import { LoginScreen } from './components/LoginScreen';
import { AnalysisDashboard } from './components/AnalysisDashboard';
import type { User, Account, SentimentResult } from './types';
import { FilterCriteria } from './types';
import { generateSalesInsightsStream, performSentimentAnalysis } from './services/geminiService';
import { mockAccounts } from './data/mockData';

// Mock users for login simulation.
const mockUsers: User[] = [
  { id: 1, name: 'John Smith', username: 'jsmith', team: 'Giants' },
  { id: 2, name: 'Alice Doe', username: 'adoe', team: 'Jets' },
];

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [sentimentResult, setSentimentResult] = useState<SentimentResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastQuestion, setLastQuestion] = useState<string>('');

  const handleLogin = (username: string) => {
    const user = mockUsers.find(u => u.username.toLowerCase() === username.toLowerCase());
    if (user) {
      setCurrentUser(user);
    } else {
      alert("Invalid credentials. Please use 'jsmith' or 'adoe'.");
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setAnalysisResult(null);
    setSentimentResult(null);
    setLastQuestion('');
  };

  const handleAnalyze = async (filters: FilterCriteria, question: string) => {
    if (!currentUser) return;

    setIsLoading(true);
    setAnalysisResult(''); // Clear previous results and prepare for stream
    setSentimentResult(null);
    setLastQuestion(question);

    try {
      // 1. Filter the mock data directly in the frontend
      const filteredAccounts = mockAccounts.filter(account => {
        const teamMatch = filters.team === 'All' || account.team === filters.team;
        const aeMatch = filters.ae === 'All' || account.ae === filters.ae;
        const tierMatch = filters.tier === 'All' || account.tier.toString() === filters.tier;
        const segmentMatch = filters.segment === 'All' || account.segment === filters.segment;
        const dateMatch = account.activities.some(act =>
          new Date(act.date) >= new Date(filters.startDate) && new Date(act.date) <= new Date(filters.endDate)
        );
        return teamMatch && aeMatch && tierMatch && segmentMatch && dateMatch;
      });

      const accountsWithFilteredActivities = filteredAccounts.map(account => ({
        ...account,
        activities: account.activities.filter(act =>
          new Date(act.date) >= new Date(filters.startDate) && new Date(act.date) <= new Date(filters.endDate)
        )
      })).filter(account => account.activities.length > 0);

      // 2. Call Gemini services
      // Start sentiment analysis in parallel (don't await yet)
      const sentimentPromise = performSentimentAnalysis(accountsWithFilteredActivities);

      // Handle streaming for insights
      const insightStream = generateSalesInsightsStream(accountsWithFilteredActivities, question);
      for await (const chunk of insightStream) {
        setAnalysisResult(prev => (prev ?? '') + chunk);
      }
      
      // Now await the sentiment analysis
      const sentiment = await sentimentPromise;
      setSentimentResult(sentiment);

    } catch (error)
    {
      console.error("Error during analysis:", error);
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
      setAnalysisResult(`Sorry, an error occurred while analyzing the data.\n\nDetails: ${errorMessage}\n\nPlease ensure the API key is configured correctly for this environment.`);
      setSentimentResult(null);
    } finally {
      setIsLoading(false);
    }
  };

  const salesTeams = useMemo(() => ['All', ...Array.from(new Set(mockAccounts.map(a => a.team)))], []);
  const accountExecutives = useMemo(() => ['All', ...Array.from(new Set(mockAccounts.map(a => a.ae)))], []);
  const tiers = useMemo(() => ['All', ...Array.from(new Set(mockAccounts.map(a => a.tier.toString()))).sort()], []);
  const segments = useMemo(() => ['All', ...Array.from(new Set(mockAccounts.map(a => a.segment))).sort()], []);


  if (!currentUser) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <div className="h-screen font-sans text-gray-800 dark:text-gray-200 bg-gray-100 dark:bg-gray-900">
      <AnalysisDashboard
        user={currentUser}
        onLogout={handleLogout}
        onAnalyze={handleAnalyze}
        isLoading={isLoading}
        analysisResult={analysisResult}
        sentimentResult={sentimentResult}
        lastQuestion={lastQuestion}
        salesTeams={salesTeams}
        accountExecutives={accountExecutives}
        tiers={tiers}
        segments={segments}
      />
    </div>
  );
}