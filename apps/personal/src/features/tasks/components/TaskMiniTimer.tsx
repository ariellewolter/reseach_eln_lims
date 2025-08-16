import React, { useState, useEffect } from 'react';
import { Square, Clock, X } from 'lucide-react';
import { useTasksStore } from '../store/useTasksStore';

export const TaskMiniTimer: React.FC = () => {
  const [elapsedTime, setElapsedTime] = useState(0);
  
  const activeTimerId = useTasksStore((state) => state.activeTimerId);
  const getTaskById = useTasksStore((state) => state.getTaskById);
  const toggleTimer = useTasksStore((state) => state.toggleTimer);
  
  const activeTask = activeTimerId ? getTaskById(activeTimerId) : null;

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (activeTimerId && activeTask) {
      const startTime = new Date(activeTask.updatedAt);
      
      interval = setInterval(() => {
        const now = new Date();
        const elapsed = Math.floor((now.getTime() - startTime.getTime()) / (1000 * 60));
        setElapsedTime(elapsed);
      }, 1000);
    } else {
      setElapsedTime(0);
    }
    
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [activeTimerId, activeTask]);

  if (!activeTask) {
    return null;
  }

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, '0')}`;
    }
    return `${mins}m`;
  };

  const handleStopTimer = () => {
    toggleTimer(activeTask.id);
  };

  const totalTime = (activeTask.spentMin || 0) + elapsedTime;

  return (
    <div className="flex items-center gap-3 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
      <div className="flex items-center gap-2">
        <Clock className="w-4 h-4 text-blue-600" />
        <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
          {activeTask.title}
        </span>
      </div>
      
      <div className="flex items-center gap-2">
        <span className="text-sm text-blue-600 dark:text-blue-400">
          {formatTime(elapsedTime)}
        </span>
        <span className="text-xs text-blue-500 dark:text-blue-500">
          (Total: {formatTime(totalTime)})
        </span>
      </div>
      
      <button
        onClick={handleStopTimer}
        className="p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded transition-colors"
        title="Stop timer"
      >
        <Square className="w-4 h-4" />
      </button>
    </div>
  );
};
