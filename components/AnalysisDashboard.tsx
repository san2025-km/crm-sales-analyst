
import React, { useState } from 'react';
import { marked } from 'marked';
import type { User, FilterCriteria, SentimentResult } from '../types';
import { SpinnerIcon } from './icons/SpinnerIcon';
import { BotIcon } from './icons/BotIcon';
import { SentimentAnalysisReport } from './SentimentAnalysisReport';

interface AnalysisDashboardProps {
  user: User;
  onLogout: () => void;
  onAnalyze: (filters: FilterCriteria, question: string) => void;
  isLoading: boolean;
  analysisResult: string | null;
  sentimentResult: SentimentResult | null;
  lastQuestion: string;
  salesTeams: string[];
  accountExecutives: string[];
  tiers: string[];
  segments: string[];
}

const exampleQuestions = [
    "What are the most common problems prospects are trying to solve?",
    "When we lose, what are the primary reasons mentioned in calls and notes?",
    "What competitive alternatives are prospects considering?",
    "Summarize the key reasons we win deals based on this data.",
];

function getISODateMonthsAgo(months: number): string {
    const d = new Date();
    d.setMonth(d.getMonth() - months);
    return d.toISOString().split('T')[0];
}

export const AnalysisDashboard: React.FC<AnalysisDashboardProps> = ({
  user,
  onLogout,
  onAnalyze,
  isLoading,
  analysisResult,
  sentimentResult,
  lastQuestion,
  salesTeams,
  accountExecutives,
  tiers,
  segments
}) => {
  const [question, setQuestion] = useState('');
  const [filters, setFilters] = useState<FilterCriteria>({
    team: 'All',
    ae: 'All',
    startDate: getISODateMonthsAgo(3),
    endDate: new Date().toISOString().split('T')[0],
    tier: 'All',
    segment: 'All',
  });

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (question.trim()) {
        onAnalyze(filters, question);
    }
  };

  const handleExampleClick = (exQuestion: string) => {
    setQuestion(exQuestion);
    onAnalyze(filters, exQuestion);
  }

  return (
    <div className="flex flex-col h-full">
      <header className="flex-shrink-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Sales Insights Dashboard <span className="text-sm font-normal text-gray-500 dark:text-gray-400">Version 2</span></h1>
        <div className="flex items-center gap-4">
            <span className="text-sm">Welcome, {user.name}</span>
            <button onClick={onLogout} className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline">
                Logout
            </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-6 md:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Filter Controls */}
          <section className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-8">
            <h2 className="text-lg font-semibold mb-4">Analysis Scope</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label htmlFor="team" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Sales Team</label>
                <select id="team" name="team" value={filters.team} onChange={handleFilterChange} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-gray-50 dark:bg-gray-700 focus:ring-indigo-500 focus:border-indigo-500">
                    {salesTeams.map(team => <option key={team} value={team}>{team}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="ae" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Account Executive</label>
                <select id="ae" name="ae" value={filters.ae} onChange={handleFilterChange} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-gray-50 dark:bg-gray-700 focus:ring-indigo-500 focus:border-indigo-500">
                    {accountExecutives.map(ae => <option key={ae} value={ae}>{ae}</option>)}
                </select>
              </div>
               <div>
                <label htmlFor="tier" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tier</label>
                <select id="tier" name="tier" value={filters.tier} onChange={handleFilterChange} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-gray-50 dark:bg-gray-700 focus:ring-indigo-500 focus:border-indigo-500">
                    {tiers.map(tier => <option key={tier} value={tier}>{tier}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="segment" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Segment</label>
                <select id="segment" name="segment" value={filters.segment} onChange={handleFilterChange} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-gray-50 dark:bg-gray-700 focus:ring-indigo-500 focus:border-indigo-500">
                    {segments.map(segment => <option key={segment} value={segment}>{segment}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Start Date</label>
                <input type="date" id="startDate" name="startDate" value={filters.startDate} onChange={handleFilterChange} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-gray-50 dark:bg-gray-700 focus:ring-indigo-500 focus:border-indigo-500"/>
              </div>
              <div>
                <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">End Date</label>
                <input type="date" id="endDate" name="endDate" value={filters.endDate} onChange={handleFilterChange} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-gray-50 dark:bg-gray-700 focus:ring-indigo-500 focus:border-indigo-500"/>
              </div>
            </div>
          </section>

          {/* Question & Action */}
          <section className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <form onSubmit={handleSubmit}>
                <label htmlFor="question" className="block text-lg font-semibold mb-2">Ask a strategic question</label>
                <textarea
                    id="question"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="e.g., What are the top 3 pain points our customers mention?"
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-gray-50 dark:bg-gray-700 focus:ring-indigo-500 focus:border-indigo-500"
                    rows={3}
                />
                <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex flex-wrap gap-2 items-center">
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Or try one of these:</span>
                        {exampleQuestions.map((ex, i) => (
                             <button type="button" key={i} onClick={() => handleExampleClick(ex)} className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline text-left">
                                "{ex}"
                            </button>
                        ))}
                    </div>
                    <button type="submit" disabled={isLoading || !question.trim()} className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-md shadow-sm hover:bg-indigo-700 disabled:bg-indigo-400 dark:disabled:bg-indigo-800 disabled:cursor-not-allowed w-full sm:w-auto flex-shrink-0">
                        {isLoading ? 'Analyzing...' : 'Generate Insights'}
                    </button>
                </div>
            </form>
          </section>

          {/* Results */}
          <section className="mt-8">
            {isLoading && analysisResult === '' && (
                 <div className="flex flex-col items-center justify-center p-8 bg-white dark:bg-gray-800 rounded-lg shadow-md text-center">
                    <SpinnerIcon className="w-12 h-12 text-indigo-500"/>
                    <h3 className="mt-4 text-lg font-semibold">Analyzing CRM Data...</h3>
                    <p className="text-gray-600 dark:text-gray-400">This may take a moment.</p>
                 </div>
            )}

            {(analysisResult !== null || sentimentResult) && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md prose prose-sm dark:prose-invert max-w-none">
                        <h3 className="font-bold text-lg mb-2">Insight for: "{lastQuestion}"</h3>
                        <div dangerouslySetInnerHTML={{ __html: marked.parse(analysisResult || '') as string }} />
                        {isLoading && <span className="inline-block w-2 h-4 bg-gray-700 dark:bg-gray-300 animate-pulse ml-1" aria-label="text generating"></span>}
                    </div>
                    <div className="lg:col-span-1">
                        {sentimentResult ? (
                            <SentimentAnalysisReport result={sentimentResult} />
                        ) : (
                            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md h-full flex flex-col justify-center items-center text-center">
                                <h3 className="font-bold text-lg mb-2">Sentiment Analysis</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  {isLoading ? 'Analyzing meeting transcripts...' : 'No meeting transcripts were found for the selected criteria, so sentiment could not be analyzed.'}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {!isLoading && analysisResult === null && !sentimentResult && (
                <div className="flex flex-col items-center justify-center p-8 bg-white/50 dark:bg-gray-800/50 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 text-center">
                    <BotIcon className="w-12 h-12 text-gray-400 dark:text-gray-500 mb-4"/>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Your insights will appear here</h3>
                    <p className="text-gray-600 dark:text-gray-400">Select your filters and ask a question to begin.</p>
                 </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
};