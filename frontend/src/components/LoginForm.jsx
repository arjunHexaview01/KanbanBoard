import React, { useState } from 'react';
import { useBoardStore } from '../store/useBoardStore';
import { LogIn, UserPlus } from 'lucide-react';

export default function LoginForm() {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Member');
  const [localError, setLocalError] = useState(null);

  const { login, register, isLoading, error } = useBoardStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError(null);

    if (isRegister && !name.trim()) {
      setLocalError('Name is required');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setLocalError('A valid email is required');
      return;
    }
    if (!password || password.length < 6) {
      setLocalError('Password must be at least 6 characters');
      return;
    }

    try {
      if (isRegister) {
        await register(name, email, password, role);
      } else {
        await login(email, password);
      }
    } catch (err) {
    }
  };

  const handleToggle = () => {
    setIsRegister(!isRegister);
    setLocalError(null);
  };

  const currentError = localError || error;

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2 className="auth-title">Horizon Board</h2>
          <p className="auth-subtitle">
            {isRegister ? 'Create your team member account' : 'Sign in to access your dashboard'}
          </p>
        </div>

        {currentError && (
          <div className="alert-banner alert-danger">
            <span>{currentError}</span>
          </div>
        )}

        <form className="modal-form" onSubmit={handleSubmit}>
          {isRegister && (
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                className="form-input"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className="form-input"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>

          {isRegister && (
            <div className="form-group">
              <label className="form-label">Role</label>
              <select
                className="filter-select"
                style={{ width: '100%', padding: '0.625rem 0.75rem' }}
                value={role}
                onChange={(e) => setRole(e.target.value)}
                disabled={isLoading}
              >
                <option value="Member">Team Member</option>
                <option value="Admin">Administrator</option>
              </select>
            </div>
          )}

          <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem' }} disabled={isLoading}>
            {isLoading ? (
              <span className="spinner"></span>
            ) : isRegister ? (
              <>
                <UserPlus size={16} /> Register
              </>
            ) : (
              <>
                <LogIn size={16} /> Sign In
              </>
            )}
          </button>
        </form>

        <div className="auth-toggle">
          {isRegister ? 'Already have an account?' : "Don't have an account?"}
          <button type="button" className="auth-toggle-link" onClick={handleToggle} disabled={isLoading}>
            {isRegister ? 'Sign In' : 'Sign Up'}
          </button>
        </div>
      </div>
    </div>
  );
}
