import React, { useMemo } from 'react';
import Card from './ui/Card';
import ProgressBar from './ui/ProgressBar';
import { DPREntry, WorkProgress } from '../types';

interface WorkProgressSummaryProps {
    dprEntries: DPREntry[];
    dprWorkItems: Record<string, string[]>;
}

const WorkProgressSummary: React.FC<WorkProgressSummaryProps> = ({ dprEntries, dprWorkItems }) => {
    const sortedEntries = useMemo(() => {
        return [...dprEntries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [dprEntries]);
    
    const workProgressSummary = useMemo(() => {
        if (sortedEntries.length === 0) return [];

        const latestProgressMap = new Map(sortedEntries[0].workProgress.map(p => [p.id, p.completed]));
        
        const summary = Object.entries(dprWorkItems).map(([category, items]: [string, string[]]) => {
            const total = items.length;
            let completed = 0;
            
            const itemsWithIds = items.map((text, index) => ({
                id: `${category.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${index}`,
                text,
            }));

            itemsWithIds.forEach(item => {
                if (latestProgressMap.get(item.id)) {
                    completed++;
                }
            });

            return {
                category,
                completed,
                total,
            };
        });

        return summary;
    }, [sortedEntries, dprWorkItems]);

    if (dprEntries.length === 0) {
        return (
            <Card>
                <h3 className="text-xl font-semibold mb-2 text-slate-800 dark:text-brand-text">Work Progress Summary</h3>
                <p className="text-sm text-slate-500 dark:text-brand-text-secondary">No DPR entries submitted yet.</p>
            </Card>
        );
    }

    return (
        <Card>
            <h3 className="text-xl font-semibold mb-2 text-slate-800 dark:text-brand-text">Overall Work Progress</h3>
            <p className="text-sm text-slate-500 dark:text-brand-text-secondary mb-6">
                Based on the latest report from {new Date(sortedEntries[0].date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}.
            </p>
            <div className="space-y-4">
                {workProgressSummary.map(progress => (
                    <ProgressBar
                        key={progress.category}
                        value={progress.completed}
                        max={progress.total}
                        label={`${progress.category} (${progress.completed}/${progress.total})`}
                    />
                ))}
            </div>
        </Card>
    );
};

export default WorkProgressSummary;