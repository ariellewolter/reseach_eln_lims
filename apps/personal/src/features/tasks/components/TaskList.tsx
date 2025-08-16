import React, { useState, useMemo } from 'react';
import { 
  List, 
  Grid, 
  Calendar as CalendarIcon, 
  Filter, 
  Search,
  SortAsc,
  SortDesc,
  ChevronDown,
  X
} from 'lucide-react';
import { useTasksStore } from '../store/useTasksStore';
import { TaskItem } from './TaskItem';
import { Task, TaskStatus, TaskPriority, TaskContext } from '@research/types';

interface TaskListProps {
  onTaskEdit?: (task: Task) => void;
  className?: string;
}

export const TaskList: React.FC<TaskListProps> = ({
  onTaskEdit,
  className = '',
}) => {
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const {
    getFilteredTasks,
    activeFilters,
    setFilters,
    clearFilters,
    activeSort,
    setSort,
    selectedTaskIds,
    selectTask,
    selectMultiple,
    clearSelection,
    batchUpdate,
    archiveTasks,
  } = useTasksStore();

  const tasks = getFilteredTasks();
  const hasSelection = selectedTaskIds.length > 0;

  // Filter options
  const statusOptions: TaskStatus[] = ['todo', 'in_progress', 'blocked', 'done', 'cancelled'];
  const priorityOptions: TaskPriority[] = ['low', 'med', 'high', 'urgent'];
  const contextOptions: TaskContext[] = ['lab', 'writing', 'reading', 'analysis', 'admin'];

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setFilters({ search: query });
  };

  const handleStatusFilter = (status: TaskStatus) => {
    const currentStatuses = activeFilters.status || [];
    const newStatuses = currentStatuses.includes(status)
      ? currentStatuses.filter(s => s !== status)
      : [...currentStatuses, status];
    setFilters({ status: newStatuses.length > 0 ? newStatuses : undefined });
  };

  const handlePriorityFilter = (priority: TaskPriority) => {
    const currentPriorities = activeFilters.priority || [];
    const newPriorities = currentPriorities.includes(priority)
      ? currentPriorities.filter(p => p !== priority)
      : [...currentPriorities, priority];
    setFilters({ priority: newPriorities.length > 0 ? newPriorities : undefined });
  };

  const handleContextFilter = (context: TaskContext) => {
    const currentContexts = activeFilters.context || [];
    const newContexts = currentContexts.includes(context)
      ? currentContexts.filter(c => c !== context)
      : [...currentContexts, context];
    setFilters({ context: newContexts.length > 0 ? newContexts : undefined });
  };

  const handleSort = (field: string) => {
    const newOrder = activeSort.field === field && activeSort.order === 'asc' ? 'desc' : 'asc';
    setSort(field, newOrder);
  };

  const handleSelectAll = () => {
    if (selectedTaskIds.length === tasks.length) {
      clearSelection();
    } else {
      selectMultiple(tasks.map(t => t.id));
    }
  };

  const handleBatchStatusChange = (status: TaskStatus) => {
    batchUpdate(selectedTaskIds, { status });
    clearSelection();
  };

  const handleBatchPriorityChange = (priority: TaskPriority) => {
    batchUpdate(selectedTaskIds, { priority });
    clearSelection();
  };

  const handleBatchArchive = () => {
    archiveTasks(selectedTaskIds);
  };

  const getSortIcon = (field: string) => {
    if (activeSort.field !== field) {
      return <ChevronDown className="w-4 h-4 text-gray-400" />;
    }
    return activeSort.order === 'asc' 
      ? <SortAsc className="w-4 h-4 text-blue-600" />
      : <SortDesc className="w-4 h-4 text-blue-600" />;
  };

  const activeFilterCount = [
    activeFilters.status?.length || 0,
    activeFilters.priority?.length || 0,
    activeFilters.context?.length || 0,
    activeFilters.search ? 1 : 0,
  ].reduce((sum, count) => sum + count, 0);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-semibold text-foreground">
            Tasks ({tasks.length})
          </h2>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors ${
              showFilters 
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300'
                : 'bg-card-muted text-muted hover:bg-card'
            }`}
          >
            <Filter className="w-4 h-4" />
            Filters
            {activeFilterCount > 0 && (
              <span className="px-2 py-1 text-xs bg-blue-600 text-white rounded-full">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        <div className="flex items-center gap-2">
          {hasSelection && (
            <span className="text-sm text-muted">
              {selectedTaskIds.length} selected
            </span>
          )}
          
          <button
            onClick={handleSelectAll}
            className="px-3 py-2 text-sm text-muted hover:text-foreground hover:bg-card-muted rounded-lg"
          >
            {selectedTaskIds.length === tasks.length ? 'Deselect All' : 'Select All'}
          </button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Search
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  placeholder="Search tasks..."
                  className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Status
              </label>
              <div className="space-y-2">
                {statusOptions.map((status) => (
                  <label key={status} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={activeFilters.status?.includes(status) || false}
                      onChange={() => handleStatusFilter(status)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">
                      {status.replace('_', ' ')}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Priority */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Priority
              </label>
              <div className="space-y-2">
                {priorityOptions.map((priority) => (
                  <label key={priority} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={activeFilters.priority?.includes(priority) || false}
                      onChange={() => handlePriorityFilter(priority)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">
                      {priority}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Context */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Context
              </label>
              <div className="space-y-2">
                {contextOptions.map((context) => (
                  <label key={context} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={activeFilters.context?.includes(context) || false}
                      onChange={() => handleContextFilter(context)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">
                      {context}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={clearFilters}
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
            >
              Clear all filters
            </button>
          </div>
        </div>
      )}

      {/* Batch Actions */}
      {hasSelection && (
        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
              Batch Actions:
            </span>
            
            <select
              onChange={(e) => handleBatchStatusChange(e.target.value as TaskStatus)}
              className="px-3 py-1 text-sm border border-blue-300 dark:border-blue-600 rounded bg-input text-blue-800 dark:text-blue-200"
            >
              <option value="">Change Status</option>
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {status.replace('_', ' ')}
                </option>
              ))}
            </select>
            
            <select
              onChange={(e) => handleBatchPriorityChange(e.target.value as TaskPriority)}
              className="px-3 py-1 text-sm border border-blue-300 dark:border-blue-600 rounded bg-input text-blue-800 dark:text-blue-200"
            >
              <option value="">Change Priority</option>
              {priorityOptions.map((priority) => (
                <option key={priority} value={priority}>
                  {priority}
                </option>
              ))}
            </select>
            
            <button
              onClick={handleBatchArchive}
              className="px-3 py-1 text-sm text-blue-800 dark:text-blue-200 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded"
            >
              Archive
            </button>
            
            <button
              onClick={clearSelection}
              className="ml-auto px-2 py-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Sort Header */}
      <div className="grid grid-cols-12 gap-4 px-4 py-2 text-sm font-medium text-muted border-b border-border">
        <div className="col-span-1">
          <button
            onClick={() => handleSort('status')}
            className="flex items-center gap-1 hover:text-foreground"
          >
            Status
            {getSortIcon('status')}
          </button>
        </div>
        <div className="col-span-6">
          <button
            onClick={() => handleSort('title')}
            className="flex items-center gap-1 hover:text-foreground"
          >
            Title
            {getSortIcon('title')}
          </button>
        </div>
        <div className="col-span-2">
          <button
            onClick={() => handleSort('dueDate')}
            className="flex items-center gap-1 hover:text-foreground"
          >
            Due Date
            {getSortIcon('dueDate')}
          </button>
        </div>
        <div className="col-span-2">
          <button
            onClick={() => handleSort('priority')}
            className="flex items-center gap-1 hover:text-foreground"
          >
            Priority
            {getSortIcon('priority')}
          </button>
        </div>
        <div className="col-span-1">
          <button
            onClick={() => handleSort('spentMin')}
            className="flex items-center gap-1 hover:text-foreground"
          >
            Time
            {getSortIcon('spentMin')}
          </button>
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-3">
        {tasks.length === 0 ? (
          <div className="text-center py-12 text-muted">
            <List className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">No tasks found</p>
            <p className="text-sm">Try adjusting your filters or create a new task</p>
          </div>
        ) : (
          tasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              isSelected={selectedTaskIds.includes(task.id)}
              onSelect={selectTask}
              onEdit={onTaskEdit}
            />
          ))
        )}
      </div>
    </div>
  );
};
