import React from 'react';
import TasksView from '../features/tasks/views/TasksView';
import { Task } from '@research/types';

const TasksPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        <TasksView />
      </div>
    </div>
  );
};

export default TasksPage;
