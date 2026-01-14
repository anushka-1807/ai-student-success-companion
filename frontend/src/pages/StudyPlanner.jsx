import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Brain, Target, TrendingUp, BookOpen, Plus, Edit2, Trash2, Play, Pause, BarChart3 } from 'lucide-react';
import Card from '../components/Card';
import Button from '../components/Button';
import { useStats } from '../hooks/useStats';

const StudyPlanner = () => {
  const { stats, updateStats } = useStats();
  const [subjects, setSubjects] = useState([]);
  const [exams, setExams] = useState([]);
  const [studySessions, setStudySessions] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [sessionTime, setSessionTime] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [showAddSubject, setShowAddSubject] = useState(false);
  const [showAddExam, setShowAddExam] = useState(false);
  const [newSubject, setNewSubject] = useState({ name: '', difficulty: 'medium', hoursPerWeek: 5 });
  const [newExam, setNewExam] = useState({ subject: '', date: '', name: '', importance: 'high' });

  // Load data from localStorage
  useEffect(() => {
    const savedSubjects = localStorage.getItem('studySubjects');
    const savedExams = localStorage.getItem('studyExams');
    const savedSessions = localStorage.getItem('studySessions');
    
    if (savedSubjects) setSubjects(JSON.parse(savedSubjects));
    if (savedExams) setExams(JSON.parse(savedExams));
    if (savedSessions) setStudySessions(JSON.parse(savedSessions));
  }, []);

  // Timer effect
  useEffect(() => {
    let interval;
    if (isTimerRunning && activeSession) {
      interval = setInterval(() => {
        setSessionTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, activeSession]);

  // Save data to localStorage
  const saveData = (key, data) => {
    localStorage.setItem(key, JSON.stringify(data));
  };

  // Add subject
  const addSubject = () => {
    const subject = {
      ...newSubject,
      id: Date.now(),
      totalStudyTime: 0,
      sessionsCompleted: 0
    };
    const updatedSubjects = [...subjects, subject];
    setSubjects(updatedSubjects);
    saveData('studySubjects', updatedSubjects);
    setNewSubject({ name: '', difficulty: 'medium', hoursPerWeek: 5 });
    setShowAddSubject(false);
  };

  // Add exam
  const addExam = () => {
    const exam = {
      ...newExam,
      id: Date.now(),
      daysLeft: Math.ceil((new Date(newExam.date) - new Date()) / (1000 * 60 * 60 * 24))
    };
    const updatedExams = [...exams, exam];
    setExams(updatedExams);
    saveData('studyExams', updatedExams);
    setNewExam({ subject: '', date: '', name: '', importance: 'high' });
    setShowAddExam(false);
  };

  // Start study session
  const startSession = (subjectId) => {
    const subject = subjects.find(s => s.id === subjectId);
    setActiveSession({
      id: Date.now(),
      subjectId,
      subjectName: subject.name,
      startTime: new Date(),
      duration: 0
    });
    setSessionTime(0);
    setIsTimerRunning(true);
  };

  // End study session
  const endSession = () => {
    if (activeSession) {
      const session = {
        ...activeSession,
        endTime: new Date(),
        duration: sessionTime
      };
      
      const updatedSessions = [...studySessions, session];
      setStudySessions(updatedSessions);
      saveData('studySessions', updatedSessions);

      // Update subject stats
      const updatedSubjects = subjects.map(s => 
        s.id === activeSession.subjectId 
          ? { 
              ...s, 
              totalStudyTime: s.totalStudyTime + sessionTime,
              sessionsCompleted: s.sessionsCompleted + 1
            }
          : s
      );
      setSubjects(updatedSubjects);
      saveData('studySubjects', updatedSubjects);
    }
    
    setActiveSession(null);
    setIsTimerRunning(false);
    setSessionTime(0);
  };

  // Generate AI study schedule
  const generateAISchedule = () => {
    const schedule = subjects.map(subject => {
      const difficultyMultiplier = {
        easy: 0.8,
        medium: 1.0,
        hard: 1.3,
        expert: 1.6
      };
      
      const baseTime = subject.hoursPerWeek;
      const adjustedTime = baseTime * difficultyMultiplier[subject.difficulty];
      const sessionsPerWeek = Math.ceil(adjustedTime / 2); // 2-hour sessions
      
      return {
        subject: subject.name,
        difficulty: subject.difficulty,
        weeklyHours: adjustedTime,
        sessionsPerWeek,
        recommendedDuration: Math.floor(adjustedTime / sessionsPerWeek * 60), // minutes
        priority: subject.difficulty === 'hard' || subject.difficulty === 'expert' ? 'high' : 'medium'
      };
    });

    return schedule.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getDifficultyColor = (difficulty) => {
    const colors = {
      easy: 'bg-green-500',
      medium: 'bg-yellow-500',
      hard: 'bg-orange-500',
      expert: 'bg-red-500'
    };
    return colors[difficulty] || colors.medium;
  };

  const getImportanceColor = (importance) => {
    const colors = {
      low: 'bg-blue-500',
      medium: 'bg-yellow-500',
      high: 'bg-red-500'
    };
    return colors[importance] || colors.medium;
  };

  const aiSchedule = generateAISchedule();

  return (
    <div className="max-w-7xl mx-auto space-y-8 relative">
      {/* Floating background elements */}
      <div className="absolute top-0 left-1/4 w-72 h-72 bg-gradient-to-r from-blue-400/10 to-purple-600/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute top-20 right-1/4 w-96 h-96 bg-gradient-to-r from-purple-400/8 to-pink-600/8 rounded-full blur-3xl animate-pulse delay-1000"></div>

      <div className="relative z-10">
        {/* Header */}
        <Card variant="gradient" className="p-8 mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl">
              <Brain className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Intelligent Study Planner
              </h1>
              <p className="text-gray-600 dark:text-gray-300 text-lg">
                AI-powered study scheduling with difficulty-based time allocation
              </p>
            </div>
          </div>
        </Card>

        {/* Active Study Session */}
        {activeSession && (
          <Card variant="floating" className="p-6 mb-8 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-r from-green-500 to-blue-600 rounded-xl animate-pulse">
                  <Play className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    Studying: {activeSession.subjectName}
                  </h3>
                  <p className="text-3xl font-mono font-bold text-blue-600 dark:text-blue-400">
                    {formatTime(sessionTime)}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsTimerRunning(!isTimerRunning)}
                >
                  {isTimerRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  {isTimerRunning ? 'Pause' : 'Resume'}
                </Button>
                <Button variant="danger" onClick={endSession}>
                  End Session
                </Button>
              </div>
            </div>
          </Card>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Subjects & Schedule */}
          <div className="lg:col-span-2 space-y-6">
            {/* Subjects Management */}
            <Card variant="default" className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <BookOpen className="h-6 w-6 text-blue-500" />
                  My Subjects
                </h2>
                <Button onClick={() => setShowAddSubject(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Subject
                </Button>
              </div>

              {showAddSubject && (
                <Card variant="glass" className="p-4 mb-6">
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Subject name"
                      value={newSubject.name}
                      onChange={(e) => setNewSubject({...newSubject, name: e.target.value})}
                      className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                    <select
                      value={newSubject.difficulty}
                      onChange={(e) => setNewSubject({...newSubject, difficulty: e.target.value})}
                      className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                      <option value="expert">Expert</option>
                    </select>
                    <input
                      type="number"
                      placeholder="Hours per week"
                      value={newSubject.hoursPerWeek}
                      onChange={(e) => setNewSubject({...newSubject, hoursPerWeek: parseInt(e.target.value)})}
                      className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                    <div className="flex gap-2">
                      <Button onClick={addSubject} size="sm">Add</Button>
                      <Button variant="outline" onClick={() => setShowAddSubject(false)} size="sm">Cancel</Button>
                    </div>
                  </div>
                </Card>
              )}

              <div className="space-y-3">
                {subjects.map((subject) => (
                  <Card key={subject.id} variant="glass" className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${getDifficultyColor(subject.difficulty)}`}></div>
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">{subject.name}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {subject.difficulty} • {subject.hoursPerWeek}h/week • {subject.sessionsCompleted} sessions
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {!activeSession && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => startSession(subject.id)}
                          >
                            <Play className="h-4 w-4 mr-1" />
                            Study
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </Card>

            {/* AI Generated Schedule */}
            {subjects.length > 0 && (
              <Card variant="gradient" className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-6">
                  <Brain className="h-6 w-6 text-purple-500" />
                  AI Study Schedule
                </h2>
                <div className="space-y-4">
                  {aiSchedule.map((item, index) => (
                    <Card key={index} variant="glass" className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">{item.subject}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {item.weeklyHours.toFixed(1)}h/week • {item.sessionsPerWeek} sessions • {item.recommendedDuration}min each
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded-full text-xs text-white ${item.priority === 'high' ? 'bg-red-500' : 'bg-blue-500'}`}>
                            {item.priority} priority
                          </span>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </Card>
            )}
          </div>

          {/* Right Column - Exams & Analytics */}
          <div className="space-y-6">
            {/* Exam Countdown */}
            <Card variant="default" className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Target className="h-5 w-5 text-red-500" />
                  Exam Countdown
                </h2>
                <Button variant="outline" size="sm" onClick={() => setShowAddExam(true)}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {showAddExam && (
                <Card variant="glass" className="p-4 mb-4">
                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="Exam name"
                      value={newExam.name}
                      onChange={(e) => setNewExam({...newExam, name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                    />
                    <input
                      type="text"
                      placeholder="Subject"
                      value={newExam.subject}
                      onChange={(e) => setNewExam({...newExam, subject: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                    />
                    <input
                      type="date"
                      value={newExam.date}
                      onChange={(e) => setNewExam({...newExam, date: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                    />
                    <div className="flex gap-2">
                      <Button onClick={addExam} size="sm">Add</Button>
                      <Button variant="outline" onClick={() => setShowAddExam(false)} size="sm">Cancel</Button>
                    </div>
                  </div>
                </Card>
              )}

              <div className="space-y-3">
                {exams.map((exam) => (
                  <Card key={exam.id} variant="glass" className="p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white text-sm">{exam.name}</h3>
                        <p className="text-xs text-gray-600 dark:text-gray-400">{exam.subject}</p>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold text-sm ${exam.daysLeft <= 7 ? 'text-red-500' : exam.daysLeft <= 14 ? 'text-yellow-500' : 'text-green-500'}`}>
                          {exam.daysLeft} days
                        </p>
                        <div className={`w-2 h-2 rounded-full ${getImportanceColor(exam.importance)}`}></div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </Card>

            {/* Study Analytics */}
            <Card variant="floating" className="p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-6">
                <BarChart3 className="h-5 w-5 text-green-500" />
                Study Analytics
              </h2>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-gradient-to-r from-blue-500/10 to-purple-600/10 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {studySessions.length}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Total Sessions</p>
                  </div>
                  <div className="text-center p-3 bg-gradient-to-r from-green-500/10 to-blue-600/10 rounded-lg">
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {Math.floor(studySessions.reduce((acc, session) => acc + session.duration, 0) / 3600)}h
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Study Time</p>
                  </div>
                </div>

                {subjects.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="font-medium text-gray-900 dark:text-white text-sm">Subject Progress</h3>
                    {subjects.map((subject) => (
                      <div key={subject.id} className="flex items-center justify-between text-sm">
                        <span className="text-gray-700 dark:text-gray-300">{subject.name}</span>
                        <span className="text-gray-600 dark:text-gray-400">
                          {Math.floor(subject.totalStudyTime / 3600)}h
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudyPlanner;
