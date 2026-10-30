import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { VALIDATION_TASKS } from '../data/initialData';
import { TaskObservation, ParticipantRecord } from '../types';
import { 
  FlaskConical, 
  Play, 
  Square, 
  RotateCcw, 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  Clock, 
  Star, 
  Download, 
  ExternalLink, 
  MessageSquare, 
  Check, 
  AlertTriangle,
  UserCheck,
  FileText,
  BarChart2,
  Trash2,
  Save,
  HelpCircle as QuestionIcon
} from 'lucide-react';

export const UsabilityTestingModule: React.FC = () => {
  const {
    participants,
    activeParticipantId,
    setActiveParticipantId,
    activeParticipant,
    updateTaskObservation,
    updateOpenEnded,
    updateRatings,
    updateParticipantInfo,
    updateParticipantNotes,
    resetParticipantsToDefault,
    exportValidationDataCsv,
    setCurrentRole,
    setActiveView,
    addToast
  } = useApp();

  const [activeTab, setActiveTab] = useState<'tasks' | 'questions' | 'summary'>('tasks');

  // Task timer state
  const [timerRunning, setTimerRunning] = useState<number | null>(null); // taskId or null
  const [timerSeconds, setTimerSeconds] = useState<number>(0);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  useEffect(() => {
    let interval: any = null;
    if (timerRunning !== null) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [timerRunning]);

  const startTaskTimer = (taskId: number) => {
    setTimerRunning(taskId);
    setTimerSeconds(0);
  };

  const stopTaskTimer = (taskId: number) => {
    updateTaskObservation(activeParticipantId, taskId, {
      completionTimeSeconds: timerSeconds,
    });
    setTimerRunning(null);
    addToast('info', 'Timer Logged', `Logged ${timerSeconds} seconds for Task ${taskId}.`);
  };

  const resetTaskTimer = () => {
    setTimerRunning(null);
    setTimerSeconds(0);
  };

  // Jump to shortcut view helper
  const handleJumpToTask = (shortcutView: any, requiredRole: any) => {
    setCurrentRole(requiredRole);
    setActiveView(shortcutView);
    addToast(
      'info',
      'Jumped to Test View',
      `Switched to role "${requiredRole === 'admin' ? 'Facility Admin' : 'Student/Faculty'}" and navigated to the task screen.`
    );
  };

  // Calculations for Summary Tab (ONLY FROM ACTUAL RECORDED DATA)
  const totalParticipants = participants.length; // 5
  
  // A participant is counted as tested if at least one task or response has been recorded
  const testedParticipants = participants.filter((p) => {
    const hasAnyTask = Object.values(p.tasks).some((t) => t.completed !== null || t.neededAssistance !== null || t.completionTimeSeconds !== null || t.difficultyNotes.trim() !== '' || t.participantComments.trim() !== '');
    const hasAnyAnswer = Object.values(p.openEnded).some((ans) => ans.trim() !== '');
    const hasRating = p.ratings.easeOfUse !== null || p.ratings.usefulness !== null || p.ratings.overallExperience !== null;
    return hasAnyTask || hasAnyAnswer || hasRating;
  });

  const taskStats = VALIDATION_TASKS.map((task) => {
    const recordedTasks = participants
      .map((p) => p.tasks[task.id])
      .filter((t) => t && t.completed !== null);

    const completedCount = recordedTasks.filter((t) => t.completed === true).length;
    const assistanceCount = participants
      .map((p) => p.tasks[task.id])
      .filter((t) => t && t.neededAssistance === true).length;

    const recordedTimes = participants
      .map((p) => p.tasks[task.id]?.completionTimeSeconds)
      .filter((sec): sec is number => sec !== null && sec !== undefined);

    const avgTime = recordedTimes.length > 0
      ? Math.round(recordedTimes.reduce((a, b) => a + b, 0) / recordedTimes.length)
      : null;

    return {
      task,
      recordedCount: recordedTasks.length,
      completedCount,
      completionRate: recordedTasks.length > 0 ? Math.round((completedCount / totalParticipants) * 100) : null,
      assistanceCount,
      assistanceRate: recordedTasks.length > 0 ? Math.round((assistanceCount / totalParticipants) * 100) : null,
      avgTime,
      recordedTimesCount: recordedTimes.length,
    };
  });

  // Calculate average ratings
  const easeRatings = participants.map((p) => p.ratings.easeOfUse).filter((r): r is number => r !== null);
  const useRatings = participants.map((p) => p.ratings.usefulness).filter((r): r is number => r !== null);
  const expRatings = participants.map((p) => p.ratings.overallExperience).filter((r): r is number => r !== null);

  const avgEase = easeRatings.length > 0 ? (easeRatings.reduce((a, b) => a + b, 0) / easeRatings.length).toFixed(1) : null;
  const avgUse = useRatings.length > 0 ? (useRatings.reduce((a, b) => a + b, 0) / useRatings.length).toFixed(1) : null;
  const avgExp = expRatings.length > 0 ? (expRatings.reduce((a, b) => a + b, 0) / expRatings.length).toFixed(1) : null;

  // Aggregate difficulties and suggestions
  const recordedDifficulties = participants.flatMap((p) => {
    const list: string[] = [];
    Object.entries(p.tasks).forEach(([tId, t]) => {
      if (t.difficultyNotes?.trim()) {
        list.push(`[${p.identifier} - Task ${tId}]: ${t.difficultyNotes.trim()}`);
      }
    });
    if (p.openEnded.q2CurrentDifficulties?.trim()) {
      list.push(`[${p.identifier} - Current Process Friction]: ${p.openEnded.q2CurrentDifficulties.trim()}`);
    }
    if (p.openEnded.q3ConfusingParts?.trim()) {
      list.push(`[${p.identifier} - Confusion Encountered]: ${p.openEnded.q3ConfusingParts.trim()}`);
    }
    return list;
  });

  const recordedImprovements = participants.flatMap((p) => {
    const list: string[] = [];
    if (p.openEnded.q5SuggestedChanges?.trim()) {
      list.push(`[${p.identifier}]: ${p.openEnded.q5SuggestedChanges.trim()}`);
    }
    Object.entries(p.tasks).forEach(([tId, t]) => {
      if (t.participantComments?.trim()) {
        list.push(`[${p.identifier} - Task ${tId} Note]: ${t.participantComments.trim()}`);
      }
    });
    return list;
  });

  return (
    <div className="space-y-6">
      {/* Usability Testing Master Header */}
      <div className="bg-gradient-to-r from-amber-950 via-slate-900 to-amber-950 text-white p-6 rounded-xl border border-amber-900/50 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded bg-amber-400 text-slate-950 text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                <FlaskConical className="w-3.5 h-3.5" />
                Tester Evaluation Suite
              </span>
              <span className="text-xs text-amber-200">
                Qualitative Usability & Workflow Feedback
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              SmartSpace Tester Evaluation Workspace
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Facilitator workspace to test participant workflows independently or under guided observation. Measure task completion, record friction points, log qualitative feedback, and export empirical evaluation evidence.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowResetConfirm(true)}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 transition-colors cursor-pointer"
              title="Reset all recorded observations and participant responses"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
              <span>Reset Testing Data</span>
            </button>

            <button
              onClick={exportValidationDataCsv}
              className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV Report</span>
            </button>
          </div>
        </div>

        {/* Participant Switcher Pills */}
        <div className="mt-6 pt-4 border-t border-slate-800/80 flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-amber-300 uppercase tracking-wider mr-2">
            Active Participant:
          </span>
          {participants.map((p) => {
            const hasData = Object.values(p.tasks).some((t) => t.completed !== null);
            return (
              <button
                key={p.id}
                onClick={() => setActiveParticipantId(p.id)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeParticipantId === p.id
                    ? 'bg-amber-400 text-slate-950 shadow-md font-bold'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 border border-slate-700'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>{p.identifier}</span>
                {hasData && (
                  <span className="w-2 h-2 rounded-full bg-emerald-400 ml-0.5"></span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Participant Profile Banner */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-800 font-black flex items-center justify-center text-sm border border-amber-300">
            P{activeParticipant.id}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-slate-900">
                Evaluating: {activeParticipant.identifier}
              </h2>
              <span className="text-[10px] font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                Anonymous ID
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Role: <strong>{activeParticipant.userType}</strong> · Dept: <strong>{activeParticipant.collegeOrDepartment}</strong>
            </p>
          </div>
        </div>

        {/* Quick Edit Participant Info */}
        <div className="flex items-center gap-2">
          <select
            value={activeParticipant.userType}
            onChange={(e) => updateParticipantInfo(activeParticipant.id, e.target.value as any, activeParticipant.collegeOrDepartment)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none"
          >
            <option value="Student">Student Participant</option>
            <option value="Faculty">Faculty Participant</option>
          </select>

          <input
            type="text"
            placeholder="Department / College"
            value={activeParticipant.collegeOrDepartment}
            onChange={(e) => updateParticipantInfo(activeParticipant.id, activeParticipant.userType, e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 w-48 focus:outline-none"
          />
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex border-b border-slate-200 bg-white rounded-t-xl px-4 pt-2">
        <button
          onClick={() => setActiveTab('tasks')}
          className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold border-b-2 cursor-pointer transition-colors ${
            activeTab === 'tasks'
              ? 'border-amber-600 text-amber-800 bg-amber-50/50 rounded-t'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <CheckCircle2 className="w-4 h-4 text-amber-600" />
          <span>Tasks Walkthrough (Tasks 1 – 6)</span>
        </button>

        <button
          onClick={() => setActiveTab('questions')}
          className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold border-b-2 cursor-pointer transition-colors ${
            activeTab === 'questions'
              ? 'border-amber-600 text-amber-800 bg-amber-50/50 rounded-t'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <QuestionIcon className="w-4 h-4 text-amber-600" />
          <span>Qualitative Questions & Subjective Ratings</span>
        </button>

        <button
          onClick={() => setActiveTab('summary')}
          className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold border-b-2 cursor-pointer transition-colors ${
            activeTab === 'summary'
              ? 'border-amber-600 text-amber-800 bg-amber-50/50 rounded-t'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <BarChart2 className="w-4 h-4 text-amber-600" />
          <span>5-Person Summary & Findings Matrix</span>
        </button>
      </div>

      {/* TAB 1: 6 TASKS WALKTHROUGH */}
      {activeTab === 'tasks' && (
        <div className="space-y-4">
          <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3.5 text-xs text-amber-950 flex items-start gap-2.5">
            <FlaskConical className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <strong>Facilitator Testing Protocol:</strong>
              <span className="ml-1">
                Guide {activeParticipant.identifier} through the 6 core tasks sequentially. Use the timer or record completion time in seconds, mark whether assistance was needed, and note specific confusion or observations.
              </span>
            </div>
          </div>

          <div className="space-y-4">
            {VALIDATION_TASKS.map((task) => {
              const obs: TaskObservation = activeParticipant.tasks[task.id] || {
                taskId: task.id,
                completed: null,
                neededAssistance: null,
                completionTimeSeconds: null,
                difficultyNotes: '',
                participantComments: '',
              };

              const isTimingThis = timerRunning === task.id;

              return (
                <div
                  key={task.id}
                  className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4"
                >
                  {/* Task Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2.5">
                      <span className="w-7 h-7 rounded-lg bg-amber-100 text-amber-900 font-black text-xs flex items-center justify-center border border-amber-300 shrink-0">
                        T{task.number}
                      </span>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900">
                          Task {task.number}: {task.title}
                        </h3>
                        <p className="text-xs text-slate-500">{task.prompt}</p>
                      </div>
                    </div>

                    {/* Shortcut jump button */}
                    <button
                      onClick={() => handleJumpToTask(task.shortcutView, task.requiredRole)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer shrink-0"
                      title="Jump directly to this task's interface in the prototype"
                    >
                      <span>Jump to Feature</span>
                      <ExternalLink className="w-3.5 h-3.5 text-blue-600" />
                    </button>
                  </div>

                  {/* Task Instructions & Criteria */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs bg-slate-50 p-3 rounded-lg border border-slate-200">
                    <div>
                      <span className="font-bold text-slate-700 block mb-0.5">Test Instructions:</span>
                      <span className="text-slate-600">{task.instructions}</span>
                    </div>
                    <div>
                      <span className="font-bold text-slate-700 block mb-0.5">Expected Success Outcome:</span>
                      <span className="text-slate-600">{task.expectedOutcome}</span>
                    </div>
                  </div>

                  {/* Facilitator Input Controls */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                    {/* 1. Success Toggle */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-700">
                        1. Completed Successfully?
                      </label>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => updateTaskObservation(activeParticipant.id, task.id, { completed: true })}
                          className={`flex-1 py-1.5 px-2.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer flex items-center justify-center gap-1 ${
                            obs.completed === true
                              ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Yes</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => updateTaskObservation(activeParticipant.id, task.id, { completed: false })}
                          className={`flex-1 py-1.5 px-2.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer flex items-center justify-center gap-1 ${
                            obs.completed === false
                              ? 'bg-red-600 text-white border-red-600 shadow-xs'
                              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>No</span>
                        </button>
                      </div>
                      {obs.completed === null && (
                        <span className="text-[10px] text-slate-400 italic">Not recorded yet</span>
                      )}
                    </div>

                    {/* 2. Assistance Toggle */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-700">
                        2. Needed Assistance?
                      </label>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => updateTaskObservation(activeParticipant.id, task.id, { neededAssistance: true })}
                          className={`flex-1 py-1.5 px-2.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer flex items-center justify-center gap-1 ${
                            obs.neededAssistance === true
                              ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          <HelpCircle className="w-3.5 h-3.5" />
                          <span>Yes</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => updateTaskObservation(activeParticipant.id, task.id, { neededAssistance: false })}
                          className={`flex-1 py-1.5 px-2.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer flex items-center justify-center gap-1 ${
                            obs.neededAssistance === false
                              ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>No (Independent)</span>
                        </button>
                      </div>
                      {obs.neededAssistance === null && (
                        <span className="text-[10px] text-slate-400 italic">Not recorded yet</span>
                      )}
                    </div>

                    {/* 3. Timer & Time Measurement */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-700">
                        3. Completion Time (Seconds)
                      </label>
                      <div className="flex items-center gap-1.5">
                        {isTimingThis ? (
                          <div className="flex items-center gap-1 flex-1">
                            <span className="px-2.5 py-1.5 bg-amber-100 text-amber-900 font-mono font-bold text-xs rounded border border-amber-300 animate-pulse">
                              {timerSeconds}s
                            </span>
                            <button
                              type="button"
                              onClick={() => stopTaskTimer(task.id)}
                              className="px-2.5 py-1.5 bg-red-600 text-white rounded text-xs font-bold hover:bg-red-700 cursor-pointer"
                              title="Stop timer and record"
                            >
                              Stop
                            </button>
                            <button
                              type="button"
                              onClick={resetTaskTimer}
                              className="p-1.5 text-slate-500 hover:text-slate-800 cursor-pointer"
                              title="Reset timer"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 flex-1">
                            <button
                              type="button"
                              onClick={() => startTaskTimer(task.id)}
                              className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded text-xs font-semibold cursor-pointer flex items-center gap-1"
                              title="Start automatic stopwatch"
                            >
                              <Play className="w-3 h-3 text-blue-600" />
                              <span>Timer</span>
                            </button>
                            <input
                              type="number"
                              min="0"
                              placeholder="Seconds"
                              value={obs.completionTimeSeconds !== null ? obs.completionTimeSeconds : ''}
                              onChange={(e) => {
                                const val = e.target.value === '' ? null : Number(e.target.value);
                                updateTaskObservation(activeParticipant.id, task.id, { completionTimeSeconds: val });
                              }}
                              className="w-20 px-2 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded text-slate-800 font-mono"
                            />
                            <span className="text-[11px] text-slate-400">sec</span>
                          </div>
                        )}
                      </div>
                      {obs.completionTimeSeconds === null && !isTimingThis && (
                        <span className="text-[10px] text-slate-400 italic">Not measured</span>
                      )}
                    </div>
                  </div>

                  {/* Qualitative Observation Fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Observed Difficulty or Confusion:
                      </label>
                      <textarea
                        rows={2}
                        placeholder="e.g. Hesitated when looking for the calendar slot, was unsure about pending vs approved distinction..."
                        value={obs.difficultyNotes}
                        onChange={(e) => updateTaskObservation(activeParticipant.id, task.id, { difficultyNotes: e.target.value })}
                        className="w-full p-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Participant Verbal Comments / Quotes:
                      </label>
                      <textarea
                        rows={2}
                        placeholder="e.g. 'It is much faster than queuing in the admin office', 'I like seeing room photos'..."
                        value={obs.participantComments}
                        onChange={(e) => updateTaskObservation(activeParticipant.id, task.id, { participantComments: e.target.value })}
                        className="w-full p-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:bg-white"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: OPEN-ENDED QUESTIONS & RATINGS */}
      {activeTab === 'questions' && (
        <div className="space-y-6">
          {/* Subjective Ratings Card */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                Subjective Participant Ratings
              </span>
              <h3 className="text-sm font-bold text-slate-900 mt-1">
                {activeParticipant.identifier} Experience Ratings (1 = Very Poor / Difficult, 5 = Excellent / Very Easy)
              </h3>
              <p className="text-[11px] text-slate-500">
                Note: Subjective participant ratings for qualitative guidance, not standardized usability psychometric scores.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Rating 1: Ease of Use */}
              <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
                <span className="text-xs font-bold text-slate-700 block">
                  1. Ease of Use
                </span>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => updateRatings(activeParticipant.id, { easeOfUse: val })}
                      className={`flex-1 py-1.5 rounded text-xs font-bold transition-all cursor-pointer ${
                        activeParticipant.ratings.easeOfUse === val
                          ? 'bg-amber-500 text-slate-950 shadow-xs scale-105'
                          : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {val}★
                    </button>
                  ))}
                </div>
                <div className="text-[10px] text-slate-400 text-center">
                  {activeParticipant.ratings.easeOfUse !== null ? `${activeParticipant.ratings.easeOfUse} / 5` : 'Not recorded'}
                </div>
              </div>

              {/* Rating 2: Usefulness */}
              <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
                <span className="text-xs font-bold text-slate-700 block">
                  2. Perceived Usefulness
                </span>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => updateRatings(activeParticipant.id, { usefulness: val })}
                      className={`flex-1 py-1.5 rounded text-xs font-bold transition-all cursor-pointer ${
                        activeParticipant.ratings.usefulness === val
                          ? 'bg-amber-500 text-slate-950 shadow-xs scale-105'
                          : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {val}★
                    </button>
                  ))}
                </div>
                <div className="text-[10px] text-slate-400 text-center">
                  {activeParticipant.ratings.usefulness !== null ? `${activeParticipant.ratings.usefulness} / 5` : 'Not recorded'}
                </div>
              </div>

              {/* Rating 3: Overall Experience */}
              <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
                <span className="text-xs font-bold text-slate-700 block">
                  3. Overall Experience
                </span>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => updateRatings(activeParticipant.id, { overallExperience: val })}
                      className={`flex-1 py-1.5 rounded text-xs font-bold transition-all cursor-pointer ${
                        activeParticipant.ratings.overallExperience === val
                          ? 'bg-amber-500 text-slate-950 shadow-xs scale-105'
                          : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {val}★
                    </button>
                  ))}
                </div>
                <div className="text-[10px] text-slate-400 text-center">
                  {activeParticipant.ratings.overallExperience !== null ? `${activeParticipant.ratings.overallExperience} / 5` : 'Not recorded'}
                </div>
              </div>
            </div>
          </div>

          {/* Usability Feedback & Interview Questions */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-5">
            <div className="border-b border-slate-100 pb-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                Usability Evaluation Feedback
              </span>
              <h3 className="text-sm font-bold text-slate-900 mt-1">
                Participant Interview Responses ({activeParticipant.identifier})
              </h3>
              <p className="text-xs text-slate-500">
                Direct feedback on workflow clarity, availability transparency, and perceived usability friction.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Q1: Find Facility */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-800">
                  1. Was it easy to find a suitable facility?
                </label>
                <textarea
                  rows={2}
                  placeholder="Participant's reaction to search, filters, room capacity, and photos..."
                  value={activeParticipant.openEnded.qFindFacilityEasy || ''}
                  onChange={(e) => updateOpenEnded(activeParticipant.id, { qFindFacilityEasy: e.target.value })}
                  className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:bg-white"
                />
              </div>

              {/* Q2: Availability Clear */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-800">
                  2. Was the availability information clear?
                </label>
                <textarea
                  rows={2}
                  placeholder="Reaction to time slot schedule, booked vs available status, pending notices..."
                  value={activeParticipant.openEnded.qAvailabilityClear || ''}
                  onChange={(e) => updateOpenEnded(activeParticipant.id, { qAvailabilityClear: e.target.value })}
                  className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:bg-white"
                />
              </div>

              {/* Q3: Booking Form Clear */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-800">
                  3. Was the booking form easy to understand?
                </label>
                <textarea
                  rows={2}
                  placeholder="Feedback on inputs, attendee limits, conflict warning messages..."
                  value={activeParticipant.openEnded.qBookingFormClear || ''}
                  onChange={(e) => updateOpenEnded(activeParticipant.id, { qBookingFormClear: e.target.value })}
                  className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:bg-white"
                />
              </div>

              {/* Q4: Status Easy to Locate */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-800">
                  4. Was the booking status easy to locate?
                </label>
                <textarea
                  rows={2}
                  placeholder="Feedback on tracking pending requests, approved permit slips, rejection reasons..."
                  value={activeParticipant.openEnded.qStatusEasyToLocate || ''}
                  onChange={(e) => updateOpenEnded(activeParticipant.id, { qStatusEasyToLocate: e.target.value })}
                  className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:bg-white"
                />
              </div>

              {/* Q5: Confusion or Difficulty */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-800">
                  5. What caused confusion or difficulty?
                </label>
                <textarea
                  rows={2}
                  placeholder="Specific points of hesitation, unexpected steps, or unclear terminology..."
                  value={activeParticipant.openEnded.qConfusionOrDifficulty || ''}
                  onChange={(e) => updateOpenEnded(activeParticipant.id, { qConfusionOrDifficulty: e.target.value })}
                  className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:bg-white"
                />
              </div>

              {/* Q6: What to Change */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-800">
                  6. What would you change about SmartSpace?
                </label>
                <textarea
                  rows={2}
                  placeholder="Feature requests, layout changes, missing notification alerts, shortcuts..."
                  value={activeParticipant.openEnded.qWhatToChange || ''}
                  onChange={(e) => updateOpenEnded(activeParticipant.id, { qWhatToChange: e.target.value })}
                  className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:bg-white"
                />
              </div>
            </div>

            {/* Context & Background Problem Questions */}
            <div className="pt-4 border-t border-slate-100 space-y-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Current Campus Reservation Process (Context)
              </span>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-800">
                    How do you currently reserve university facilities?
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Paper slips, manual logbooks, visiting office in person..."
                    value={activeParticipant.openEnded.q1CurrentProcess}
                    onChange={(e) => updateOpenEnded(activeParticipant.id, { q1CurrentProcess: e.target.value })}
                    className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:bg-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-800">
                    What difficulties do you experience with the current process?
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Accidental double bookings, unknown room schedules, delayed signatures..."
                    value={activeParticipant.openEnded.q2CurrentDifficulties}
                    onChange={(e) => updateOpenEnded(activeParticipant.id, { q2CurrentDifficulties: e.target.value })}
                    className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Tester Notes & Interview Summary */}
            <div className="pt-4 border-t border-slate-100 space-y-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 block">
                Facilitator / Observer Notes
              </span>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-800">
                    Tester Observation Notes:
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Observations on user behavior, eye movements, mouse hesitation, speed, confidence..."
                    value={activeParticipant.testerNotes || ''}
                    onChange={(e) => updateParticipantNotes(activeParticipant.id, e.target.value, activeParticipant.interviewSummary || '')}
                    className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:bg-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-800">
                    Interview Summary / Debrief:
                  </label>
                  <textarea
                    rows={3}
                    placeholder="High-level takeaway: did the participant see value in SmartSpace? Would they adopt it?..."
                    value={activeParticipant.interviewSummary || ''}
                    onChange={(e) => updateParticipantNotes(activeParticipant.id, activeParticipant.testerNotes || '', e.target.value)}
                    className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:bg-white"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: 5-PERSON VALIDATION SUMMARY & ANALYTICS */}
      {activeTab === 'summary' && (
        <div className="space-y-6">
          {/* Summary Banner */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase tracking-wider">
                  Aggregated Study Results
                </span>
                <span className="text-xs text-slate-500">
                  Sample Size: <strong>{testedParticipants.length} of {totalParticipants} participants recorded</strong>
                </span>
              </div>
              <h2 className="text-lg font-bold text-slate-900">
                5-Person Usability & Problem Relevance Synthesis
              </h2>
              <p className="text-xs text-slate-500">
                Direct evidence computed strictly from facilitator observation logs. No fabricated results.
              </p>
            </div>

            <button
              onClick={exportValidationDataCsv}
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer shrink-0"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Complete CSV</span>
            </button>
          </div>

          {/* Overview Rating Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 block mb-1">Participants Evaluated</span>
              <div className="text-2xl font-black text-slate-900">
                {testedParticipants.length} / {totalParticipants}
              </div>
              <span className="text-[11px] text-slate-400">
                {Math.round((testedParticipants.length / totalParticipants) * 100)}% tested
              </span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 block mb-1">Avg. Ease of Use</span>
              <div className="text-2xl font-black text-amber-600">
                {avgEase !== null ? `${avgEase} / 5` : 'Not recorded'}
              </div>
              <span className="text-[11px] text-slate-400">
                {easeRatings.length} participant ratings
              </span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 block mb-1">Avg. Perceived Usefulness</span>
              <div className="text-2xl font-black text-blue-600">
                {avgUse !== null ? `${avgUse} / 5` : 'Not recorded'}
              </div>
              <span className="text-[11px] text-slate-400">
                {useRatings.length} participant ratings
              </span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 block mb-1">Avg. Overall Experience</span>
              <div className="text-2xl font-black text-emerald-600">
                {avgExp !== null ? `${avgExp} / 5` : 'Not recorded'}
              </div>
              <span className="text-[11px] text-slate-400">
                {expRatings.length} participant ratings
              </span>
            </div>
          </div>

          {/* Task Completion Matrix Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50">
              <h3 className="text-sm font-bold text-slate-900">
                Task Performance & Success Breakdown (n = 5)
              </h3>
              <p className="text-[11px] text-slate-500">
                Shows exact completion counts and percentages across all 5 evaluation tasks.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                    <th className="py-2.5 px-4">Task Description</th>
                    <th className="py-2.5 px-3">Completed Successfully</th>
                    <th className="py-2.5 px-3">Needed Assistance</th>
                    <th className="py-2.5 px-3">Avg. Time (s)</th>
                    <th className="py-2.5 px-3">Individual P1–P5 Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {taskStats.map(({ task, recordedCount, completedCount, completionRate, assistanceCount, avgTime, recordedTimesCount }) => (
                    <tr key={task.id} className="hover:bg-slate-50/70">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">
                          Task {task.number}: {task.title}
                        </div>
                        <div className="text-[11px] text-slate-500">{task.expectedOutcome}</div>
                      </td>

                      <td className="py-3 px-3 whitespace-nowrap">
                        {recordedCount > 0 ? (
                          <div>
                            <span className="font-bold text-slate-800">
                              {completedCount}/{totalParticipants}
                            </span>
                            <span className="ml-1 text-[11px] text-slate-500">
                              ({completionRate}%)
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Not recorded</span>
                        )}
                      </td>

                      <td className="py-3 px-3 whitespace-nowrap">
                        {recordedCount > 0 ? (
                          <div>
                            <span className="font-bold text-amber-800">
                              {assistanceCount}/{totalParticipants}
                            </span>
                            <span className="ml-1 text-[11px] text-slate-500">
                              ({Math.round((assistanceCount / totalParticipants) * 100)}%)
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Not recorded</span>
                        )}
                      </td>

                      <td className="py-3 px-3 whitespace-nowrap font-mono">
                        {avgTime !== null ? (
                          <span className="font-bold text-slate-800">{avgTime}s <span className="font-normal text-[10px] text-slate-400">({recordedTimesCount} recorded)</span></span>
                        ) : (
                          <span className="text-slate-400 italic font-sans">Not recorded</span>
                        )}
                      </td>

                      <td className="py-3 px-3 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          {participants.map((p) => {
                            const t = p.tasks[task.id];
                            let badge = <span key={p.id} className="w-5 h-5 rounded bg-slate-100 text-slate-400 flex items-center justify-center text-[10px]" title={`${p.identifier}: Not tested`}>-</span>;
                            if (t?.completed === true) {
                              badge = <span key={p.id} className="w-5 h-5 rounded bg-emerald-100 text-emerald-800 flex items-center justify-center text-[10px] font-bold" title={`${p.identifier}: Completed`}>✓</span>;
                            } else if (t?.completed === false) {
                              badge = <span key={p.id} className="w-5 h-5 rounded bg-red-100 text-red-800 flex items-center justify-center text-[10px] font-bold" title={`${p.identifier}: Failed`}>✗</span>;
                            }
                            return badge;
                          })}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Qualitative Synthesis: Difficulties & Suggestions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Observed Difficulties */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Observed Usability Friction & Confusion ({recordedDifficulties.length})</span>
              </h3>
              <p className="text-[11px] text-slate-500">
                Specific stumbling blocks noted by facilitator during testing sessions.
              </p>

              <div className="space-y-2 max-h-64 overflow-y-auto pt-1">
                {recordedDifficulties.map((item, idx) => (
                  <div key={idx} className="p-2.5 rounded-lg bg-amber-50/60 border border-amber-200 text-xs text-amber-950">
                    {item}
                  </div>
                ))}
                {recordedDifficulties.length === 0 && (
                  <div className="p-6 text-center text-xs text-slate-400">
                    No difficulties logged yet. Enter observations in the Task or Questions tabs.
                  </div>
                )}
              </div>
            </div>

            {/* Suggested Improvements */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-blue-600" />
                <span>Participant Recommendations & Ideas ({recordedImprovements.length})</span>
              </h3>
              <p className="text-[11px] text-slate-500">
                User-requested features, changes, or suggestions for future iterations.
              </p>

              <div className="space-y-2 max-h-64 overflow-y-auto pt-1">
                {recordedImprovements.map((item, idx) => (
                  <div key={idx} className="p-2.5 rounded-lg bg-blue-50/60 border border-blue-200 text-xs text-blue-950">
                    {item}
                  </div>
                ))}
                {recordedImprovements.length === 0 && (
                  <div className="p-6 text-center text-xs text-slate-400">
                    No suggestions recorded yet.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Academic & Market Validation Disclosure */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-600 space-y-1.5">
            <strong className="text-slate-800 block">Usability Validation Interpretation Guidelines:</strong>
            <p className="text-[11px] leading-relaxed">
              This usability evaluation provides qualitative evidence of interface clarity, intuitive workflow progression, and user-perceived problem relevance. A qualitative usability evaluation does not constitute statistically significant market demand validation. Findings should be presented as initial usability feedback to inform subsequent product iterations.
            </p>
          </div>
        </div>
      )}

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4 border border-slate-200">
            <h3 className="text-base font-bold text-slate-900">
              Reset All Usability Testing Data?
            </h3>
            <p className="text-xs text-slate-600">
              This will clear all recorded task successes, assistance flags, completion times, open-ended answers, and ratings across all 5 participants.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  resetParticipantsToDefault();
                  setShowResetConfirm(false);
                }}
                className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold cursor-pointer"
              >
                Confirm Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
