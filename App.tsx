
import React, { useState, useEffect, useCallback } from 'react';
import { LoginScreen } from './components/LoginScreen';
import { AnalysisDashboard } from './components/AnalysisDashboard';
import type { User, SentimentResult, FilterCriteria } from './types';
import { mockAccounts } from './data/mockData';

const DEFAULT_PORT = '5001';
const FALLBACK_URLS = [`http://localhost:${DEFAULT_PORT}`, `http://127.0.0.1:${DEFAULT_PORT}`];
const INITIAL_BACKEND_URL = localStorage.getItem('backend_url') || FALLBACK_URLS[0];

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
  const [backendUrl, setBackendUrl] = useState<string>(INITIAL_BACKEND_URL);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(localStorage.getItem('demo_mode') === 'true');
  const [isConnecting, setIsConnecting] = useState(false);
  const [showTroubleshooter, setShowTroubleshooter] = useState(false);
  const [connectionLog, setConnectionLog] = useState<string[]>([]);
  const [serverStatus, setServerStatus] = useState<{ geminiKey: boolean, vendastaKey: boolean } | null>(null);
  
  const isHttps = window.location.protocol === 'https:';

  const [metadata, setMetadata] = useState<{
    teams: string[],
    aes: string[],
    tiers: string[],
    segments: string[]
  }>({
    teams: ['All'],
    aes: ['All'],
    tiers: ['All'],
    segments: ['All']
  });

  const addLog = (msg: string) => {
    setConnectionLog(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev].slice(0, 15));
  };

  const handleSwitchToHttp = () => {
    const newUrl = window.location.href.replace('https://', 'http://');
    window.location.href = newUrl;
  };

  const checkConnection = async (url: string) => {
    const sanitizedUrl = url.trim().replace(/\/+$/, '');
    addLog(`Testing connection to ${sanitizedUrl}...`);
    
    try {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), 3000); 
      
      const response = await fetch(`${sanitizedUrl}/api/ping`, { 
        signal: controller.signal,
        method: 'GET',
        mode: 'cors'
      });
      
      clearTimeout(id);
      const data = await response.json();
      setServerStatus(data.config);
      addLog(`✅ Server Reached!`);
      return true;
    } catch (e: any) {
      setServerStatus(null);
      if (isHttps) {
        addLog("🚨 PROTOCOL ERROR: Browser blocked the request. Use HTTP.");
      } else {
        addLog(`❌ FAILED TO FETCH: Server is not responding at ${sanitizedUrl}`);
      }
      return false;
    }
  };

  const fetchMetadata = useCallback(async (targetUrl: string, silent = false) => {
    if (!currentUser) return;
    
    if (!silent) setIsConnecting(true);
    const url = targetUrl.trim().replace(/\/+$/, '');
    
    try {
      const isAlive = await checkConnection(url);
      
      if (!isAlive) {
        throw new Error("SERVER_UNREACHABLE");
      }

      const res = await fetch(`${url}/api/metadata`);
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "SERVER_ERROR");
      }

      const data = await res.json();
      setMetadata(data);
      setIsDemoMode(false);
      localStorage.setItem('demo_mode', 'false');
      setShowTroubleshooter(false);
    } catch (err: any) {
      setIsDemoMode(true);
      setMetadata({
        teams: ['All', ...new Set(mockAccounts.map(a => a.team))],
        aes: ['All', ...new Set(mockAccounts.map(a => a.ae))],
        segments: ['All', ...new Set(mockAccounts.map(a => a.segment))],
        tiers: ['All', ...new Set(mockAccounts.map(a => a.tier.toString()))].sort()
      });
    } finally {
      setIsConnecting(false);
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser) {
      fetchMetadata(backendUrl, true);
    }
  }, [fetchMetadata, backendUrl, currentUser]);

  const handleUrlChange = (newUrl: string) => {
    setBackendUrl(newUrl);
    localStorage.setItem('backend_url', newUrl);
  };

  const handleLogin = (username: string) => {
    const user = mockUsers.find(u => u.username.toLowerCase() === username.toLowerCase());
    if (user) setCurrentUser(user);
    else alert("Invalid credentials.");
  };

  if (!currentUser) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <div className="h-screen font-sans text-gray-800 dark:text-gray-200 bg-gray-100 dark:bg-gray-900 overflow-hidden flex flex-col">
      {isHttps && !isDemoMode && (
        <div className="bg-red-600 text-white text-[10px] font-bold py-1.5 px-4 flex justify-center items-center gap-4 animate-in slide-in-from-top duration-500 z-50">
          <span>🚨 BROWSER BLOCK: Communications with localhost are forbidden over HTTPS.</span>
          <button onClick={handleSwitchToHttp} className="bg-white text-red-600 px-3 py-0.5 rounded-full hover:bg-gray-100 uppercase text-[9px]">Switch to HTTP</button>
        </div>
      )}

      {showTroubleshooter && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95">
            <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-indigo-50/30 dark:bg-indigo-900/10">
              <div>
                <h2 className="text-xl font-bold">Connectivity Assistant</h2>
                <p className="text-xs text-gray-500">Diagnosing the path to your server.</p>
              </div>
              <button onClick={() => setShowTroubleshooter(false)} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-gray-400">Connection Log</label>
                <div className="bg-gray-900 text-green-400 p-4 rounded-xl text-[10px] font-mono h-32 overflow-y-auto flex flex-col-reverse gap-1 border border-gray-800 shadow-inner">
                  {connectionLog.length === 0 ? <div className="text-gray-600">Click 'Test Connection' to start...</div> : connectionLog.map((log, i) => (
                    <div key={i} className={log.includes('❌') || log.includes('🚨') ? 'text-red-400' : log.includes('✅') ? 'text-emerald-400' : ''}>{log}</div>
                  ))}
                </div>
              </div>

              {serverStatus && (
                <div className="grid grid-cols-2 gap-3 p-4 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800">
                   <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${serverStatus.geminiKey ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      <span className="text-[10px] font-bold uppercase tracking-widest">Gemini API Key</span>
                   </div>
                   <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${serverStatus.vendastaKey ? 'bg-green-500' : 'bg-amber-500'}`}></div>
                      <span className="text-[10px] font-bold uppercase tracking-widest">Vendasta Key</span>
                   </div>
                </div>
              )}

              <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-900/50 rounded-xl">
                <p className="text-[11px] text-amber-800 dark:text-amber-300 leading-relaxed font-medium">
                  <b>"Failed to Fetch"</b> means your browser can't see the server. It is <u>not</u> caused by your API Keys. Check your terminal to see if the server is running on port 5001.
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-gray-400">Server Address</label>
                <input 
                  type="text" 
                  value={backendUrl}
                  onChange={(e) => handleUrlChange(e.target.value)}
                  className="w-full p-2.5 border dark:border-gray-700 rounded-lg text-sm bg-gray-50 dark:bg-gray-900 font-mono"
                />
              </div>
            </div>

            <div className="p-6 bg-gray-50 dark:bg-gray-900/50 flex gap-3 border-t dark:border-gray-700">
               <button onClick={() => fetchMetadata(backendUrl)} disabled={isConnecting} className="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 disabled:opacity-50">
                 {isConnecting ? 'Retrying...' : 'Test Connection'}
               </button>
               <button onClick={() => setIsDemoMode(!isDemoMode)} className="flex-1 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-bold rounded-xl">
                 {isDemoMode ? 'Exit Demo' : 'Use Demo Mode'}
               </button>
            </div>
          </div>
        </div>
      )}
      
      <div className="flex-1 overflow-hidden">
        <AnalysisDashboard
          user={currentUser}
          onLogout={() => setCurrentUser(null)}
          onAnalyze={async (filters, question) => {
            setIsLoading(true);
            setAnalysisResult(null);
            setSentimentResult(null);
            setLastQuestion(question);
            try {
              const url = backendUrl.trim().replace(/\/+$/, '');
              const response = await fetch(`${url}/api/analyze`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ filters, question }),
              });
              if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error || "Analysis Failed");
              }
              const result = await response.json();
              setAnalysisResult(result.insight);
              setSentimentResult(result.sentiment);
            } catch (error: any) {
              setAnalysisResult(`### ⚠️ Analysis Error\n\n${error.message}\n\n**Troubleshooting:**\n- If this says "Failed to Fetch", your server is offline.\n- If it mentions "API Key", check your backend \`.env\` file.`);
            } finally {
              setIsLoading(false);
            }
          }}
          onFixConnection={() => setShowTroubleshooter(true)}
          isLoading={isLoading}
          analysisResult={analysisResult}
          sentimentResult={sentimentResult}
          lastQuestion={lastQuestion}
          salesTeams={metadata.teams}
          accountExecutives={metadata.aes}
          tiers={metadata.tiers}
          segments={metadata.segments}
          isOffline={isDemoMode}
        />
      </div>
    </div>
  );
}
