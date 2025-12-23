
import React from 'react';
import type { SentimentResult, KeyMoment } from '../types';
import { ThumbsUpIcon } from './icons/ThumbsUpIcon';
import { ThumbsDownIcon } from './icons/ThumbsDownIcon';

interface SentimentAnalysisReportProps {
  result: SentimentResult;
}

const SentimentBar: React.FC<{ score: number }> = ({ score }) => {
  const percentage = (score + 1) * 50; // Convert score from [-1, 1] to [0, 100]
  const bgColor = score < -0.2 ? 'bg-red-500' : score > 0.2 ? 'bg-green-500' : 'bg-yellow-500';

  return (
    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
      <div
        className={`${bgColor} h-4 rounded-full transition-all duration-500`}
        style={{ width: `${percentage}%` }}
      ></div>
    </div>
  );
};

const MomentCard: React.FC<{ moment: KeyMoment }> = ({ moment }) => {
    const isPositive = moment.sentiment === 'Positive';
    const icon = isPositive ? <ThumbsUpIcon className="text-green-500" /> : <ThumbsDownIcon className="text-red-500" />;
    const borderColor = isPositive ? 'border-l-green-500' : 'border-l-red-500';

    return (
        <div className={`p-3 border-l-4 ${borderColor} bg-gray-50 dark:bg-gray-900/50 rounded-r-md`}>
            <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-1">{icon}</div>
                <div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">"{moment.quote}"</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">- {moment.accountName}</p>
                </div>
            </div>
        </div>
    );
};


export const SentimentAnalysisReport: React.FC<SentimentAnalysisReportProps> = ({ result }) => {
  const positiveMoments = result.keyMoments.filter(m => m.sentiment === 'Positive');
  const negativeMoments = result.keyMoments.filter(m => m.sentiment === 'Negative');

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md h-full">
      <h3 className="font-bold text-lg mb-4">Sentiment Analysis</h3>
      <div>
        <div className="flex justify-between items-center mb-1 text-sm font-medium">
            <span className="text-red-500">Negative</span>
            <span className="text-green-500">Positive</span>
        </div>
        <SentimentBar score={result.overallScore} />
        <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-2">{result.summary}</p>
      </div>

      <div className="mt-6 space-y-4">
        {positiveMoments.length > 0 && (
          <div>
            <h4 className="font-semibold text-md mb-2">Key Positive Moments</h4>
            <div className="space-y-3">
                {positiveMoments.map((moment, index) => <MomentCard key={`pos-${index}`} moment={moment} />)}
            </div>
          </div>
        )}
        {negativeMoments.length > 0 && (
          <div>
            <h4 className="font-semibold text-md mb-2">Key Negative Moments</h4>
            <div className="space-y-3">
                {negativeMoments.map((moment, index) => <MomentCard key={`neg-${index}`} moment={moment} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
