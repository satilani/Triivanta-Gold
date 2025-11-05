

import React from 'react';
import Card from './ui/Card';
import { RISK_ASSESSMENT_DATA } from '../constants';

const RiskAssessment: React.FC = () => {
  return (
    <Card>
      <h3 className="text-xl font-semibold mb-6 text-slate-800 dark:text-brand-text">Risk Assessment & Mitigation</h3>
      <div className="space-y-4">
        {RISK_ASSESSMENT_DATA.slice(0, 3).map((item, index) => ( // Show top 3 risks for brevity
          <div key={index} className="bg-slate-50 dark:bg-brand-secondary/50 p-3 rounded-lg border border-slate-200 dark:border-brand-border/50">
            <h4 className="font-semibold text-brand-accent dark:text-brand-accent-light mb-1 flex items-center text-sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-yellow-500 dark:text-yellow-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              {item.risk}
            </h4>
            <p className="text-xs text-slate-600 dark:text-brand-text-secondary pl-6">
                {item.mitigation}
            </p>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default RiskAssessment;