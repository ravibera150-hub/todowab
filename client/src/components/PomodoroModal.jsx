/**
 * =========================================================================
 * Pomodoro Focus Timer Modal (components/PomodoroModal.jsx)
 * =========================================================================
 * Dedicated Pomodoro focus session timer for a specific task.
 * 
 * VIVA EXPLANATION:
 * - Implements the Pomodoro Technique: 25 minutes of unbroken focus followed
 *   by short (5m) or long (15m) rest intervals.
 * - Uses SVG stroke-dashoffset calculations to render a smooth circular countdown.
 * - Triggers Web Audio API celebration chime when the session concludes.
 * - Persists completed focus time back to MongoDB via `recordPomodoroSession`.
 */

import React, { useState, useEffect, useRef } from 'react';
import { X, Play, Pause, RotateCcw, Flame, CheckCircle, Volume2 } from 'lucide-react';
import { useTasks } from '../context/TaskContext';
import { soundEffects } from '../utils/audio';

const MODES = {
  focus: { label: '25 min Focus', minutes: 25 },
  shortBreak: { label: '5 min Break', minutes: 5 },
  longBreak: { label: '15 min Long Break', minutes: 15 },
};

const PomodoroModal = () => {
  const { activePomodoroTask, setActivePomodoroTask, recordPomodoroSession } = useTasks();

  const [mode, setMode] = useState('focus');
  const [timeLeft, setTimeLeft] = useState(MODES.focus.minutes * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [completedSessions, setCompletedSessions] = useState(0);

  const timerRef = useRef(null);

  // When active task changes, reset timer
  useEffect(() => {
    if (activePomodoroTask) {
      setMode('focus');
      setTimeLeft(MODES.focus.minutes * 60);
      setIsRunning(false);
    }
  }, [activePomodoroTask]);

  // Main countdown interval loop
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setIsRunning(false);
            soundEffects.playTimerAlert();

            // If focus mode completed, record focus minutes
            if (mode === 'focus' && activePomodoroTask) {
              recordPomodoroSession(activePomodoroTask._id, MODES.focus.minutes);
              setCompletedSessions((s) => s + 1);
            }

            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }

    return () => clearInterval(timerRef.current);
  }, [isRunning, mode, activePomodoroTask, recordPomodoroSession]);

  if (!activePomodoroTask) return null;

  const totalTime = MODES[mode].minutes * 60;
  const progressFraction = (totalTime - timeLeft) / totalTime;

  // SVG Circle calculation
  const radius = 90;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - progressFraction * circumference;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const switchMode = (newMode) => {
    setIsRunning(false);
    setMode(newMode);
    setTimeLeft(MODES[newMode].minutes * 60);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(MODES[mode].minutes * 60);
  };

  const handleClose = () => {
    setIsRunning(false);
    setActivePomodoroTask(null);
  };

  return (
    <div
      className="modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="pomodoro-title"
    >
      <div className="modal-box" style={{ maxWidth: '440px' }}>
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Flame size={22} color="var(--primary)" />
            <h2 id="pomodoro-title" className="modal-title" style={{ fontSize: '1.25rem' }}>
              Focus Mode
            </h2>
          </div>
          <button type="button" className="btn-icon" onClick={handleClose}>
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="timer-modal-content">
          {/* Active Task Name */}
          <div className="timer-task-badge" title={activePomodoroTask.title}>
            <span>Working on:</span>
            <strong>{activePomodoroTask.title}</strong>
          </div>

          {/* Mode Tabs */}
          <div className="timer-modes">
            <button
              type="button"
              className={`mode-tab ${mode === 'focus' ? 'active' : ''}`}
              onClick={() => switchMode('focus')}
            >
              25 min Focus
            </button>
            <button
              type="button"
              className={`mode-tab ${mode === 'shortBreak' ? 'active' : ''}`}
              onClick={() => switchMode('shortBreak')}
            >
              5 min Break
            </button>
            <button
              type="button"
              className={`mode-tab ${mode === 'longBreak' ? 'active' : ''}`}
              onClick={() => switchMode('longBreak')}
            >
              15 min Rest
            </button>
          </div>

          {/* Circular Countdown Progress */}
          <div className="timer-circle-container">
            <svg className="timer-svg" viewBox="0 0 200 200">
              <circle
                className="timer-circle-bg"
                cx="100"
                cy="100"
                r={radius}
              />
              <circle
                className={`timer-circle-progress ${isRunning ? 'running' : ''}`}
                cx="100"
                cy="100"
                r={radius}
                style={{
                  strokeDasharray: circumference,
                  strokeDashoffset,
                }}
              />
            </svg>
            <div className="timer-display-inner">
              <span className="timer-time-text">{formattedTime}</span>
              <span className="timer-status-text">
                {isRunning ? (mode === 'focus' ? 'Focusing' : 'Resting') : 'Paused'}
              </span>
            </div>
          </div>

          {/* Action Controls */}
          <div className="timer-controls">
            <button
              type="button"
              className={`btn btn-primary timer-btn-primary ${isRunning ? 'btn-danger' : ''}`}
              onClick={() => setIsRunning(!isRunning)}
            >
              {isRunning ? (
                <>
                  <Pause size={18} />
                  <span>Pause</span>
                </>
              ) : (
                <>
                  <Play size={18} />
                  <span>{timeLeft === 0 ? 'Restart' : 'Start Focus'}</span>
                </>
              )}
            </button>

            <button
              type="button"
              className="timer-btn-icon"
              onClick={handleReset}
              title="Reset Timer"
            >
              <RotateCcw size={18} />
            </button>
          </div>

          {/* Footer Info */}
          <div className="timer-footer-info">
            <CheckCircle size={15} color="var(--success)" />
            <span>
              {completedSessions} focus session{completedSessions !== 1 ? 's' : ''} completed today
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PomodoroModal;
