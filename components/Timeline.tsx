import React, { useMemo, useState } from 'react';
import Card from './ui/Card';
import { ProjectPhase, Task } from '../types';

interface TimelineProps {
  timelineData: ProjectPhase[];
  setTimelineData: React.Dispatch<React.SetStateAction<ProjectPhase[]>>;
}

const Timeline: React.FC<TimelineProps> = ({ timelineData, setTimelineData }) => {
  const [newTaskTexts, setNewTaskTexts] = useState<{ [key: number]: string }>({});
    
  const getStatus = (phase: ProjectPhase) => {
    // Forcing a fixed date for consistent demo purposes
    const demoNow = new Date('2026-02-15');
    if (demoNow > phase.endDate) {
      return { text: 'Completed', color: 'bg-green-500', icon: 'M5 13l4 4L19 7' };
    }
    if (demoNow >= phase.startDate && demoNow <= phase.endDate) {
      return { text: 'In Progress', color: 'bg-yellow-500', icon: 'M12 8v4l3 3' };
    }
    return { text: 'Upcoming', color: 'bg-blue-500', icon: 'M8 7V3m8 4V3' };
  };

  const timelineWithStatus = useMemo(() => {
    return timelineData.map(phase => ({
      ...phase,
      status: getStatus(phase),
    }));
  }, [timelineData]);
  
  const handleToggleKeyActionDetail = (phaseIndex: number, actionIndex: number, detailIndex: number) => {
    setTimelineData(currentTimeline =>
        currentTimeline.map((phase, pIdx) => {
            if (pIdx !== phaseIndex) return phase;
            return {
                ...phase,
                keyActions: phase.keyActions.map((action, aIdx) => {
                    if (aIdx !== actionIndex) return action;
                    return {
                        ...action,
                        details: action.details.map((detail, dIdx) => {
                            if (dIdx !== detailIndex) return detail;
                            return { ...detail, completed: !detail.completed };
                        })
                    };
                })
            };
        })
    );
  };

  const handleToggleTask = (phaseIndex: number, taskId: string) => {
    const updatedTimeline = timelineData.map((phase, pIndex) => {
        if (pIndex === phaseIndex && phase.tasks) {
            return {
                ...phase,
                tasks: phase.tasks.map(task => 
                    task.id === taskId ? { ...task, completed: !task.completed } : task
                )
            };
        }
        return phase;
    });
    setTimelineData(updatedTimeline);
  };

  const handleAddTask = (phaseIndex: number) => {
    const taskText = newTaskTexts[phaseIndex]?.trim();
    if (!taskText) return;

    const newTask: Task = {
      id: `task-${phaseIndex}-${Date.now()}`,
      text: taskText,
      completed: false,
    };
    
    const updatedTimeline = timelineData.map((phase, pIndex) => {
        if (pIndex === phaseIndex) {
            const updatedTasks = phase.tasks ? [...phase.tasks, newTask] : [newTask];
            return { ...phase, tasks: updatedTasks };
        }
        return phase;
    });

    setTimelineData(updatedTimeline);
    setNewTaskTexts(prev => ({ ...prev, [phaseIndex]: '' }));
  };
  
  const handleNewTaskChange = (phaseIndex: number, text: string) => {
      setNewTaskTexts(prev => ({...prev, [phaseIndex]: text}));
  };

  const handleDeleteTask = (phaseIndex: number, taskId: string) => {
    const updatedTimeline = timelineData.map((phase, pIndex) => {
        if (pIndex === phaseIndex && phase.tasks) {
            return {
                ...phase,
                tasks: phase.tasks.filter(task => task.id !== taskId)
            };
        }
        return phase;
    });
    setTimelineData(updatedTimeline);
  };

  return (
    <Card>
      <h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-brand-text">Project Implementation Timeline</h2>
      <div className="relative border-l-2 border-slate-200 dark:border-brand-border ml-4">
        {timelineWithStatus.map((phase, index) => (
          <div key={phase.phase} className="mb-10 ml-8">
            <span className={`absolute -left-[1.35rem] flex items-center justify-center w-10 h-10 ${phase.status.color} rounded-full ring-8 ring-white dark:ring-brand-dark`}>
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={phase.status.icon}></path></svg>
            </span>
            <div className="bg-slate-50 dark:bg-brand-secondary/50 p-4 rounded-lg shadow-sm border border-slate-200 dark:border-brand-border">
                <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-brand-text">{phase.phase}. {phase.title}</h3>
                    <span className={`text-sm font-medium px-2.5 py-0.5 rounded ${phase.status.color} text-white`}>{phase.status.text}</span>
                </div>
                <time className="block mb-3 text-sm font-normal leading-none text-slate-400 dark:text-brand-text-secondary">{phase.duration}</time>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                        <h4 className="font-semibold text-brand-accent mb-2">Key Actions:</h4>
                        <div className="space-y-3">
                            {phase.keyActions.map((action, actionIndex) => (
                                <div key={actionIndex}>
                                    <p className="font-semibold text-slate-600 dark:text-brand-text-secondary">{action.name}</p>
                                    <div className="space-y-1 mt-1 pl-2">
                                        {action.details.map((detail, detailIndex) => (
                                        <div key={detailIndex} className="flex items-center">
                                            <input
                                                type="checkbox"
                                                id={`detail-${index}-${actionIndex}-${detailIndex}`}
                                                checked={detail.completed}
                                                onChange={() => handleToggleKeyActionDetail(index, actionIndex, detailIndex)}
                                                className="h-4 w-4 rounded border-slate-300 dark:border-brand-border bg-slate-100 dark:bg-slate-700 text-brand-accent focus:ring-brand-accent focus:ring-offset-white dark:focus:ring-offset-brand-secondary/50"
                                            />
                                            <label htmlFor={`detail-${index}-${actionIndex}-${detailIndex}`} className={`ml-2 text-xs cursor-pointer ${detail.completed ? 'text-slate-400 dark:text-slate-500 line-through' : 'text-slate-500 dark:text-brand-text-secondary/80'}`}>
                                                {detail.text}
                                            </label>
                                        </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div>
                         <h4 className="font-semibold text-brand-accent-light mb-1">Deliverables:</h4>
                        <ul className="list-disc list-inside text-slate-500 dark:text-brand-text-secondary space-y-1">
                            {phase.deliverables.map((item, i) => <li key={i}>{item}</li>)}
                        </ul>
                    </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-slate-200 dark:border-brand-border">
                    <h4 className="font-semibold text-slate-800 dark:text-brand-text mb-2">Tasks</h4>
                    <div className="space-y-2">
                        {phase.tasks && phase.tasks.map(task => (
                            <div key={task.id} className="flex items-center justify-between bg-white dark:bg-brand-dark p-2 rounded-md group">
                                <div className="flex items-center">
                                    <input 
                                        type="checkbox" 
                                        id={`task-${task.id}`}
                                        checked={task.completed}
                                        onChange={() => handleToggleTask(index, task.id)}
                                        className="h-4 w-4 rounded border-slate-300 dark:border-brand-border bg-slate-100 dark:bg-slate-700 text-brand-accent focus:ring-brand-accent focus:ring-offset-white dark:focus:ring-offset-brand-dark"
                                    />
                                    <label htmlFor={`task-${task.id}`} className={`ml-3 text-sm cursor-pointer ${task.completed ? 'text-slate-400 dark:text-slate-500 line-through' : 'text-slate-700 dark:text-brand-text'}`}>
                                        {task.text}
                                    </label>
                                </div>
                                <button onClick={() => handleDeleteTask(index, task.id)} className="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </div>
                        ))}
                         {(!phase.tasks || phase.tasks.length === 0) && <p className="text-sm text-slate-500 dark:text-brand-text-secondary italic">No tasks for this phase yet.</p>}
                    </div>
                    <div className="mt-3 flex items-center space-x-2">
                        <input
                            type="text"
                            value={newTaskTexts[index] || ''}
                            onChange={(e) => handleNewTaskChange(index, e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleAddTask(index)}
                            placeholder="Add a new task..."
                            className="flex-grow bg-white dark:bg-brand-secondary border border-slate-300 dark:border-brand-border text-slate-800 dark:text-brand-text text-sm rounded-lg focus:ring-brand-accent focus:border-brand-accent block w-full p-2"
                        />
                        <button onClick={() => handleAddTask(index)} className="bg-brand-accent hover:bg-brand-accent-light text-white font-bold py-2 px-4 rounded-lg text-sm transition-colors">
                            Add
                        </button>
                    </div>
                </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default Timeline;