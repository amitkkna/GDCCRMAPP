"use client";

import React, { useState, useEffect } from 'react';
import { Plus, Loader2, AlertCircle, Filter, X, PlusCircle } from 'lucide-react';
import TaskList from './TaskList';
import TaskForm from './TaskForm';
import { Task, TaskStatus } from '@/types/database.types';
import { getTasksByStatusWithEnquiries, updateTask, deleteTask } from '@/lib/api';

export default function TasksPage() {
  const [pendingTasks, setPendingTasks] = useState<Task[]>([]);
  const [completedTasks, setCompletedTasks] = useState<Task[]>([]);
  const [filteredPendingTasks, setFilteredPendingTasks] = useState<Task[]>([]);
  const [filteredCompletedTasks, setFilteredCompletedTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'pending' | 'completed'>('pending');
  const [showForm, setShowForm] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [assigneeFilter, setAssigneeFilter] = useState<'Amit' | 'Prateek' | 'All'>('All');
  const [showFilters, setShowFilters] = useState(false);
  const [fromDateFilter, setFromDateFilter] = useState('');
  const [toDateFilter, setToDateFilter] = useState('');

  // Get the query parameters from URL
  const isNew = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('new') : null;
  const editId = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('edit') : null;

  useEffect(() => {
    loadTasks();

    // Show form if 'new' or 'edit' query parameter is present
    if (isNew) {
      setShowForm(true);
    }
  }, [isNew, editId]);

  // Apply filters when filter criteria change
  useEffect(() => {
    applyFilters();
  }, [assigneeFilter, fromDateFilter, toDateFilter]);

  const loadTasks = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [pendingData, completedData] = await Promise.all([
        getTasksByStatusWithEnquiries('Pending'),
        getTasksByStatusWithEnquiries('Completed')
      ]);

      setPendingTasks(pendingData);
      setCompletedTasks(completedData);

      // Apply filters
      applyFilters(pendingData, completedData);

      // If there's an edit ID in the URL, find and select that task
      if (editId) {
        const taskToEdit = [...pendingData, ...completedData].find(
          (task) => task.id === editId
        );
        if (taskToEdit) {
          setSelectedTask(taskToEdit);
          setShowForm(true);
          setActiveTab(taskToEdit.status === 'Pending' ? 'pending' : 'completed');
        }
      }
    } catch (error) {
      console.error('Error loading tasks:', error);
      setError('Failed to load tasks. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = (pendingData = pendingTasks, completedData = completedTasks) => {
    let filteredPending = [...pendingData];
    let filteredCompleted = [...completedData];

    // Filter by assignee
    if (assigneeFilter !== 'All') {
      filteredPending = filteredPending.filter(task => task.assigned_to === assigneeFilter);
      filteredCompleted = filteredCompleted.filter(task => task.assigned_to === assigneeFilter);
    }

    // Filter by date range - from date
    if (fromDateFilter) {
      filteredPending = filteredPending.filter(task => {
        if (!task.due_date) return true;
        const taskDate = new Date(task.due_date);
        const fromDate = new Date(fromDateFilter);
        return taskDate >= fromDate;
      });

      filteredCompleted = filteredCompleted.filter(task => {
        if (!task.due_date) return true;
        const taskDate = new Date(task.due_date);
        const fromDate = new Date(fromDateFilter);
        return taskDate >= fromDate;
      });
    }

    // Filter by date range - to date
    if (toDateFilter) {
      filteredPending = filteredPending.filter(task => {
        if (!task.due_date) return true;
        const taskDate = new Date(task.due_date);
        const toDate = new Date(toDateFilter);
        // Set time to end of day for inclusive filtering
        toDate.setHours(23, 59, 59, 999);
        return taskDate <= toDate;
      });

      filteredCompleted = filteredCompleted.filter(task => {
        if (!task.due_date) return true;
        const taskDate = new Date(task.due_date);
        const toDate = new Date(toDateFilter);
        // Set time to end of day for inclusive filtering
        toDate.setHours(23, 59, 59, 999);
        return taskDate <= toDate;
      });
    }

    setFilteredPendingTasks(filteredPending);
    setFilteredCompletedTasks(filteredCompleted);
  };

  const clearFilters = () => {
    setAssigneeFilter('All');
    setFromDateFilter('');
    setToDateFilter('');
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value as 'pending' | 'completed');
  };

  const handleNewTask = () => {
    setSelectedTask(null);
    setShowForm(true);
    // Update URL without full page reload
    window.history.pushState({}, '', '/tasks?new=true');
  };

  const handleEditTask = (task: Task) => {
    setSelectedTask(task);
    setShowForm(true);
    // Update URL without full page reload
    window.history.pushState({}, '', `/tasks?edit=${task.id}`);
  };

  const handleTaskCreated = () => {
    setShowForm(false);
    // Update URL without full page reload
    window.history.pushState({}, '', '/tasks');
    loadTasks();
  };

  const handleFormCancel = () => {
    setShowForm(false);
    // Update URL without full page reload
    window.history.pushState({}, '', '/tasks');
  };

  const handleCompleteTask = async (task: Task) => {
    try {
      await updateTask(task.id, { status: 'Completed' });
      loadTasks();
    } catch (error) {
      console.error('Error completing task:', error);
    }
  };

  const handleReopenTask = async (task: Task) => {
    try {
      await updateTask(task.id, { status: 'Pending' });
      loadTasks();
    } catch (error) {
      console.error('Error reopening task:', error);
    }
  };

  const handleDeleteTask = async (task: Task) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await deleteTask(task.id);
        loadTasks();
      } catch (error) {
        console.error('Error deleting task:', error);
      }
    }
  };

  return (
    <div>
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {!showForm && (
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Filter className="h-5 w-5 text-gray-400 mr-2" />
              <span className="text-sm font-medium text-gray-700">Filters:</span>
            </div>
            <button
              onClick={handleNewTask}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Plus className="-ml-1 mr-2 h-5 w-5" />
              New Task
            </button>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <select
              className="block w-full sm:w-auto pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              value={assigneeFilter}
              onChange={(e) => setAssigneeFilter(e.target.value as 'Amit' | 'Prateek' | 'All')}
            >
              <option value="All">All Assignees</option>
              <option value="Amit">Amit</option>
              <option value="Prateek">Prateek</option>
            </select>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {showFilters ? 'Hide advanced filters' : 'Show advanced filters'}
            </button>
          </div>

          {showFilters && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="from-date" className="block text-sm font-medium text-gray-700 mb-1">
                    From Date
                  </label>
                  <input
                    type="date"
                    id="from-date"
                    className="focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    value={fromDateFilter}
                    onChange={(e) => setFromDateFilter(e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="to-date" className="block text-sm font-medium text-gray-700 mb-1">
                    To Date
                  </label>
                  <input
                    type="date"
                    id="to-date"
                    className="focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    value={toDateFilter}
                    onChange={(e) => setToDateFilter(e.target.value)}
                  />
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <button
                  onClick={clearFilters}
                  className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {showForm ? (
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">
            {selectedTask ? 'Edit Task' : 'New Task'}
          </h2>
          <TaskForm
            initialData={selectedTask}
            onSubmit={handleTaskCreated}
            onCancel={handleFormCancel}
          />
        </div>
      ) : (
        <>
          <div className="mb-4">
            <div className="flex space-x-2">
              <button
                onClick={() => handleTabChange('pending')}
                className={`px-4 py-2 text-sm font-medium rounded-md ${
                  activeTab === 'pending'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Pending Tasks ({filteredPendingTasks.length})
              </button>
              <button
                onClick={() => handleTabChange('completed')}
                className={`px-4 py-2 text-sm font-medium rounded-md ${
                  activeTab === 'completed'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Completed Tasks ({filteredCompletedTasks.length})
              </button>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg overflow-hidden">
            {isLoading ? (
              <div className="p-6 text-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto" />
                <p className="mt-4 text-gray-500">Loading tasks...</p>
              </div>
            ) : (
              <>
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium text-gray-900">
                      {activeTab === 'pending' ? 'Pending Tasks' : 'Completed Tasks'}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Showing {activeTab === 'pending' ? filteredPendingTasks.length : filteredCompletedTasks.length} tasks
                    </p>
                  </div>
                </div>

                {activeTab === 'pending' && (
                  <TaskList
                    tasks={filteredPendingTasks}
                    onEdit={handleEditTask}
                    onComplete={handleCompleteTask}
                    onDelete={handleDeleteTask}
                    emptyMessage="No pending tasks found"
                  />
                )}

                {activeTab === 'completed' && (
                  <TaskList
                    tasks={filteredCompletedTasks}
                    onEdit={handleEditTask}
                    onReopen={handleReopenTask}
                    onDelete={handleDeleteTask}
                    emptyMessage="No completed tasks found"
                  />
                )}
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}
