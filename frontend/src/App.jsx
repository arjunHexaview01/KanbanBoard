import React, { useState, useEffect } from 'react';
import { useBoardStore } from './store/useBoardStore';
import LoginForm from './components/LoginForm';
import FilterBar from './components/FilterBar';
import BoardColumn from './components/BoardColumn';
import WorkloadWidget from './components/WorkloadWidget';
import TaskModal from './components/TaskModal';
import { Plus, LogOut, LayoutGrid, RefreshCw, AlertTriangle } from 'lucide-react';
import './App.css';

export default function App() {
  const {
    token,
    currentUser,
    tasks,
    isLoading,
    error,
    logout,
    fetchTasks,
    fetchUsers,
    fetchWorkloadReport,
  } = useBoardStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  useEffect(() => {
    if (token) {
      fetchUsers();
      fetchTasks();
      fetchWorkloadReport();
    }
  }, [token]);

  const handleCreateClick = () => {
    setEditingTask(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingTask(null);
  };

  const handleRefresh = () => {
    fetchTasks();
    fetchWorkloadReport();
  };

  if (!token || !currentUser) {
    return <LoginForm />;
  }

  const todoTasks = tasks.filter((t) => t.status === 'Todo');
  const progressTasks = tasks.filter((t) => t.status === 'In Progress');
  const doneTasks = tasks.filter((t) => t.status === 'Done');

  const userInitials = currentUser.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="brand-section">
          <LayoutGrid size={24} style={{ color: 'var(--color-primary)' }} />
          <h1 className="brand-title">Kanban Board</h1>
        </div>

        <div className="user-profile-section">
          <div className="user-avatar">{userInitials}</div>
          <div className="user-info">
            <span className="user-name">{currentUser.name}</span>
            <span className="user-role">{currentUser.role}</span>
          </div>
          <button className="btn-logout" onClick={logout} aria-label="Sign Out">
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {error && (
        <div className="alert-banner alert-danger">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertTriangle size={16} />
            <span>{error}</span>
          </div>
          <button
            className="btn-icon-action"
            onClick={handleRefresh}
            title="Retry request"
          >
            <RefreshCw size={14} />
          </button>
        </div>
      )}

      <div className="dashboard-grid">
        <main className="main-content">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <FilterBar />
            <button className="btn-primary" onClick={handleCreateClick}>
              <Plus size={16} /> Create Task
            </button>
          </div>

          {isLoading && tasks.length === 0 ? (
            <div className="loading-overlay">
              <span className="spinner spinner-large"></span>
              <span style={{ color: 'var(--text-secondary)' }}>Loading your dashboard...</span>
            </div>
          ) : (
            <div className="board-columns">
              <BoardColumn
                status="Todo"
                tasks={todoTasks}
                onEdit={handleEditClick}
              />
              <BoardColumn
                status="In Progress"
                tasks={progressTasks}
                onEdit={handleEditClick}
              />
              <BoardColumn
                status="Done"
                tasks={doneTasks}
                onEdit={handleEditClick}
              />
            </div>
          )}
        </main>

        <aside>
          <WorkloadWidget />
        </aside>
      </div>

      {isModalOpen && (
        <TaskModal task={editingTask} onClose={handleModalClose} />
      )}
    </div>
  );
}
