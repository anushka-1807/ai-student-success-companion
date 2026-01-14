import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  BookOpen,
  Calculator,
  ArrowRight,
  User,
  Brain,
  TrendingUp,
  Activity,
  AlertTriangle,
  Clock,
} from 'lucide-react';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import Card from '../components/Card';
import Button from '../components/Button';
import { historyApi } from '../api';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';

// Smart Student Dashboard
function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [semesterInfo, setSemesterInfo] = useState(null);
  const [resumeHistory, setResumeHistory] = useState([]);
  const [notesHistory, setNotesHistory] = useState([]);
  const [sgpaHistory, setSgpaHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch user-specific data: semester info from Firestore + history from existing API
  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      setLoading(true);
      setError('');

      try {
        // 1) Fetch / ensure semester info in Firestore under users/{uid}
        const userRef = doc(db, 'users', user.uid);
        const snap = await getDoc(userRef);
        let data = snap.exists() ? snap.data() : {};

        if (!data.semester) {
          // Default semester info if not present
          const defaultSemester = 1;
          const updated = {
            ...data,
            semester: defaultSemester,
            updatedAt: serverTimestamp(),
          };
          await setDoc(userRef, updated, { merge: true });
          data = { ...data, semester: defaultSemester };
        }
        setSemesterInfo({
          semester: data.semester,
        });

        // 2) Fetch history via existing backend (already user-scoped via Firebase token)
        const [resumeRes, notesRes, sgpaRes] = await Promise.all([
          historyApi.getResumes(),
          historyApi.getNotes(),
          historyApi.getSGPA(),
        ]);

        if (resumeRes.data.success) setResumeHistory(resumeRes.data.data || []);
        if (notesRes.data.success) setNotesHistory(notesRes.data.data || []);
        if (sgpaRes.data.success) setSgpaHistory(sgpaRes.data.data || []);
      } catch (err) {
        console.error('Dashboard load error:', err);
        setError(err.response?.data?.error || err.message || 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  // Helpers to get latest items
  const latestResume = useMemo(
    () => (resumeHistory && resumeHistory.length ? resumeHistory[0] : null),
    [resumeHistory]
  );

  const latestNotes = useMemo(
    () => (notesHistory && notesHistory.length ? notesHistory[0] : null),
    [notesHistory]
  );

  const latestSGPA = useMemo(
    () => (sgpaHistory && sgpaHistory.length ? sgpaHistory[0] : null),
    [sgpaHistory]
  );

  // Core dashboard metrics
  const resumeReadiness = latestResume?.analysis?.overallScore ?? null;

  // Approximate notes coverage: count of distinct topics and a simple completion ratio
  const notesCoverage = useMemo(() => {
    if (!notesHistory.length) {
      return {
        completedSubjects: 0,
        totalSubjects: 0,
        percentage: null,
      };
    }

    const subjectMap = new Map();
    notesHistory.forEach((item) => {
      const subject =
        item.notes?.subject ||
        item.notes?.title ||
        item.fileName ||
        'Topic';
      const key = String(subject).trim();
      subjectMap.set(key, (subjectMap.get(key) || 0) + 1);
    });

    const completedSubjects = subjectMap.size;
    // Heuristic: assume 5 note sessions per subject for 100% completion
    const normalizedTotals = Array.from(subjectMap.values()).map((count) =>
      Math.min(1, count / 5)
    );
    const avgCompletion =
      normalizedTotals.reduce((sum, v) => sum + v, 0) /
      (normalizedTotals.length || 1);

    return {
      completedSubjects,
      totalSubjects: completedSubjects > 0 ? completedSubjects : 0,
      percentage: Math.round(avgCompletion * 100),
      subjectMap,
    };
  }, [notesHistory]);

  // SGPA trend metrics
  const sgpaTrend = useMemo(() => {
    if (!sgpaHistory.length) {
      return {
        latest: null,
        trendLabel: 'Not enough data',
        trendDelta: null,
        points: [],
      };
    }

    const ordered = [...sgpaHistory].sort((a, b) => {
      const ta = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
      const tb = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
      return ta - tb;
    });

    const points = ordered.map((item, index) => ({
      label: item.semester || `S${index + 1}`,
      value: Number(item.sgpa) || 0,
    }));

    const latest = points[points.length - 1];
    const prev = points.length > 1 ? points[points.length - 2] : null;
    const trendDelta = prev ? +(latest.value - prev.value).toFixed(2) : null;
    let trendLabel = 'Stable';
    if (trendDelta !== null) {
      if (trendDelta > 0.1) trendLabel = 'Improving';
      else if (trendDelta < -0.1) trendLabel = 'Dropping';
    } else {
      trendLabel = 'First SGPA recorded';
    }

    return { latest, trendLabel, trendDelta, points };
  }, [sgpaHistory]);

  // Weak subject heuristic using notes coverage + SGPA trend
  const weakSubject = useMemo(() => {
    if (!notesCoverage.subjectMap || !notesCoverage.subjectMap.size) return null;

    // Pick subject with the lowest note count as weakest prepared
    let weakest = null;
    let minCount = Infinity;
    notesCoverage.subjectMap.forEach((count, subject) => {
      if (count < minCount) {
        minCount = count;
        weakest = subject;
      }
    });

    return weakest;
  }, [notesCoverage]);

  // History preview (last 3 activities across tools)
  const historyPreview = useMemo(() => {
    const tagged = [];

    resumeHistory.slice(0, 3).forEach((item) =>
      tagged.push({ type: 'resume', createdAt: item.createdAt, item })
    );
    notesHistory.slice(0, 3).forEach((item) =>
      tagged.push({ type: 'notes', createdAt: item.createdAt, item })
    );
    sgpaHistory.slice(0, 3).forEach((item) =>
      tagged.push({ type: 'sgpa', createdAt: item.createdAt, item })
    );

    const sorted = tagged.sort((a, b) => {
      const ta = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
      const tb = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
      return tb - ta;
    });

    return sorted.slice(0, 3);
  }, [resumeHistory, notesHistory, sgpaHistory]);

  // Smart "Next Best Action" recommendation
  const recommendation = useMemo(() => {
    if (!latestResume && !latestNotes && !latestSGPA) {
      return 'Start by analyzing your resume or generating notes for one of your subjects.';
    }

    if (resumeReadiness !== null && resumeReadiness < 70) {
      return 'Your resume readiness is below 70%. Run a new resume analysis and focus on improving weak sections.';
    }

    if (notesCoverage.percentage !== null && notesCoverage.percentage < 60) {
      if (weakSubject) {
        return `You should generate more notes for ${weakSubject} to balance your preparation.`;
      }
      return 'Generate notes for at least one more subject to improve your overall coverage.';
    }

    if (sgpaTrend.latest && sgpaTrend.latest.value < 8) {
      return 'Your recent SGPA suggests room for improvement. Review low-scoring subjects with fresh notes and practice questions.';
    }

    return 'You are on a solid track. Keep your resume updated and continue generating notes for upcoming subjects.';
  }, [
    latestResume,
    latestNotes,
    latestSGPA,
    resumeReadiness,
    notesCoverage,
    weakSubject,
    sgpaTrend,
  ]);

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Unknown date';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Simple line chart for SGPA trend using SVG
  const SGPAChart = ({ points }) => {
    if (!points || !points.length) {
      return (
        <div className="h-32 flex items-center justify-center text-sm text-gray-500 dark:text-gray-400">
          Not enough data to show SGPA trend yet.
        </div>
      );
    }

    const values = points.map((p) => p.value);
    const min = Math.min(...values, 0);
    const max = Math.max(...values, 10);
    const paddingX = 10;
    const paddingY = 10;
    const width = 260;
    const height = 120;
    const stepX =
      points.length > 1
        ? (width - paddingX * 2) / (points.length - 1)
        : 0;

    const toY = (v) => {
      const ratio = max === min ? 0.5 : (v - min) / (max - min);
      return height - paddingY - ratio * (height - paddingY * 2);
    };

    const pathD = points
      .map((p, i) => {
        const x = paddingX + i * stepX;
        const y = toY(p.value);
        return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
      })
      .join(' ');

    return (
      <div className="h-32 flex flex-col justify-between">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-24 text-blue-500 dark:text-blue-400"
        >
          <defs>
            <linearGradient id="sgpaLine" x1="0" x2="1" y1="0" y2="0">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#a855f7" />
            </linearGradient>
          </defs>
          <path
            d={pathD}
            fill="none"
            stroke="url(#sgpaLine)"
            strokeWidth="3"
            strokeLinecap="round"
          />
          {points.map((p, i) => {
            const x = paddingX + i * stepX;
            const y = toY(p.value);
            return (
              <circle
                key={p.label}
                cx={x}
                cy={y}
                r={4}
                className="fill-white dark:fill-gray-900 stroke-blue-500 dark:stroke-blue-400"
                strokeWidth="2"
              />
            );
          })}
        </svg>
        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
          {points.map((p) => (
            <span key={p.label}>{p.label}</span>
          ))}
        </div>
      </div>
    );
  };

  const NotesProgressBars = ({ subjectMap }) => {
    if (!subjectMap || !subjectMap.size) {
      return (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Generate notes to see your subject-wise coverage here.
        </p>
      );
    }

    const items = Array.from(subjectMap.entries()).slice(0, 4);

    return (
      <div className="space-y-3">
        {items.map(([subject, count]) => {
          const completion = Math.min(100, (count / 5) * 100);
          return (
            <div key={subject}>
              <div className="flex justify-between text-xs mb-1 text-gray-500 dark:text-gray-400">
                <span className="truncate pr-2">{subject}</span>
                <span>
                  {count}/5 sessions
                </span>
              </div>
              <div className="h-2 rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
                  style={{ width: `${completion}%` }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-10 space-y-6">
        <div className="h-28 rounded-2xl bg-surface-100 dark:bg-gray-800/80 animate-pulse" />
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-28 rounded-2xl bg-surface-100 dark:bg-gray-800/80 animate-pulse"
            />
          ))}
        </div>
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="h-48 rounded-2xl bg-surface-100 dark:bg-gray-800/80 animate-pulse" />
          <div className="h-48 rounded-2xl bg-surface-100 dark:bg-gray-800/80 animate-pulse" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto">
        <Card className="text-center py-10">
          <div className="mx-auto mb-4 w-10 h-10 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
            <AlertTriangle className="h-5 w-5 text-red-500" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Unable to load dashboard</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()} variant="outline">
            Try again
          </Button>
        </Card>
      </div>
    );
  }

  const displayName = user?.displayName || 'Student';

  return (
    <div className="max-w-6xl mx-auto relative">
      {/* Subtle floating background elements */}
      <div className="absolute top-0 left-1/4 w-72 h-72 bg-gradient-to-r from-blue-400/15 to-purple-600/15 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute top-20 right-1/4 w-96 h-96 bg-gradient-to-r from-purple-400/10 to-pink-600/10 rounded-full blur-3xl animate-pulse delay-1000"></div>

      <div className="relative z-10 space-y-8">
        {/* Top greeting & overview */}
        <Card variant="gradient" className="p-8 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/15 to-purple-600/15 rounded-full blur-2xl"></div>
          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <p className="text-sm text-blue-700 dark:text-blue-100 mb-1 flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Smart Student Dashboard
              </p>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                Welcome back, {displayName.split(' ')[0]} 👋
              </h2>
              <p className="text-gray-700 dark:text-blue-50/80 max-w-xl">
                Track your resume, notes, and SGPA in one place. Use the insights below to decide your next best move.
              </p>
            </div>
            <div className="flex flex-col items-start md:items-end gap-1">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500 dark:text-blue-100/80">
                Current Semester
              </p>
              <p className="text-3xl font-semibold text-primary-600 dark:text-white">
                {semesterInfo?.semester ? `Sem ${semesterInfo.semester}` : 'Not set'}
              </p>
            </div>
          </div>
        </Card>

        {/* Insight cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card variant="floating" className="p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                  <FileText className="h-4 w-4" />
                </div>
                <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Resume Readiness
                </p>
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {resumeReadiness !== null ? `${resumeReadiness}` : '--'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">/ 100</p>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {resumeReadiness !== null
                ? 'Based on your last AI resume analysis.'
                : 'Analyze your resume to get a readiness score.'}
            </p>
          </Card>

          <Card variant="floating" className="p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 text-white">
                  <BookOpen className="h-4 w-4" />
                </div>
                <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Notes Coverage
                </p>
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {notesCoverage.percentage !== null ? `${notesCoverage.percentage}%` : '--'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {notesCoverage.completedSubjects > 0
                  ? `${notesCoverage.completedSubjects} active subject(s)`
                  : 'No subjects yet'}
              </p>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Estimated from your generated notes sessions.
            </p>
          </Card>

          <Card variant="floating" className="p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-gradient-to-br from-green-500 to-teal-500 text-white">
                  <TrendingUp className="h-4 w-4" />
                </div>
                <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  SGPA Trend
                </p>
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {sgpaTrend.latest ? sgpaTrend.latest.value.toFixed(2) : '--'}
              </p>
              {sgpaTrend.trendDelta !== null && (
                <span
                  className={`text-xs font-medium flex items-center gap-1 ${
                    sgpaTrend.trendDelta > 0
                      ? 'text-success-500'
                      : sgpaTrend.trendDelta < 0
                      ? 'text-danger-500'
                      : 'text-gray-500 dark:text-gray-400'
                  }`}
                >
                  {sgpaTrend.trendDelta > 0 ? '' : sgpaTrend.trendDelta < 0 ? '' : ''}
                  {Math.abs(sgpaTrend.trendDelta)}
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {sgpaTrend.trendLabel}
              {sgpaTrend.trendDelta !== null && (
                <span className="ml-1 font-medium">
                  ({sgpaTrend.trendDelta > 0 ? '+' : ''}
                  {sgpaTrend.trendDelta})
                </span>
              )}
            </p>
          </Card>

          <Card variant="floating" className="p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 text-white">
                  <Brain className="h-4 w-4" />
                </div>
                <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Weak Subject
                </p>
              </div>
            </div>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {weakSubject || 'Not enough data'}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Estimated from subjects with the least note coverage.
            </p>
          </Card>
        </div>

        {/* Primary feature cards */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card
            variant="floating"
            hover
            onClick={() => navigate('/resume-upload')}
            className="group cursor-pointer"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    Resume Analyzer
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Improve your resume score.
                  </p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-gray-400 group-hover:translate-x-1 transition-transform" />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
              {latestResume?.analysis?.overallScore
                ? `Last score: ${latestResume.analysis.overallScore}/100`
                : 'No resume analysis yet.'}
            </p>
            <Button size="sm" variant="secondary" className="mt-auto">
              Open Resume Analyzer
            </Button>
          </Card>

          <Card
            variant="floating"
            hover
            onClick={() => navigate('/notes-generator')}
            className="group cursor-pointer"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 text-white">
                  <BookOpen className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    Notes Generator
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Turn content into smart notes.
                  </p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-gray-400 group-hover:translate-x-1 transition-transform" />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
              {latestNotes?.notes?.title || latestNotes?.fileName
                ? `Last topic: ${latestNotes.notes?.title || latestNotes.fileName}`
                : 'No notes generated yet.'}
            </p>
            <Button size="sm" variant="secondary" className="mt-auto">
              Open Notes Generator
            </Button>
          </Card>

          <Card
            variant="floating"
            hover
            onClick={() => navigate('/sgpa-calculator')}
            className="group cursor-pointer"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-gradient-to-br from-green-500 to-teal-500 text-white">
                  <Calculator className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    SGPA Calculator
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Track your performance.
                  </p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-gray-400 group-hover:translate-x-1 transition-transform" />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
              {latestSGPA?.sgpa
                ? `Last SGPA: ${Number(latestSGPA.sgpa).toFixed(2)}`
                : 'No SGPA calculations yet.'}
            </p>
            <Button size="sm" variant="secondary" className="mt-auto">
              Open SGPA Calculator
            </Button>
          </Card>
        </div>

        {/* Progress & history */}
        <div className="grid lg:grid-cols-3 gap-6">
          <Card variant="glass" className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-blue-500" /> SGPA History
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Visual overview of your SGPA over time.
                </p>
              </div>
            </div>
            <SGPAChart points={sgpaTrend.points} />
          </Card>

          <Card variant="glass">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text:white flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-purple-500" /> Notes Progress
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Subject-wise notes completion.
                </p>
              </div>
            </div>
            <NotesProgressBars subjectMap={notesCoverage.subjectMap} />
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* History preview */}
          <Card variant="floating" className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-500" /> Recent Activity
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Last 3 actions across all tools.
                </p>
              </div>
              <button
                onClick={() => navigate('/history')}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
              >
                View full history
              </button>
            </div>
            {historyPreview.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Use any tool to start building your activity history.
              </p>
            ) : (
              <div className="space-y-3">
                {historyPreview.map((entry, index) => {
                  let icon = FileText;
                  let colorClasses = 'bg-blue-100 text-blue-600';
                  let title = 'Resume Analysis';
                  let details = '';

                  if (entry.type === 'notes') {
                    icon = BookOpen;
                    colorClasses = 'bg-purple-100 text-purple-600';
                    title = entry.item.notes?.title || entry.item.fileName || 'Generated Notes';
                    details = 'Notes generation';
                  } else if (entry.type === 'sgpa') {
                    icon = Calculator;
                    colorClasses = 'bg-green-100 text-green-600';
                    title = 'SGPA Calculation';
                    details = `SGPA: ${entry.item.sgpa}`;
                  } else if (entry.type === 'resume') {
                    details = entry.item.analysis?.overallScore
                      ? `Score: ${entry.item.analysis.overallScore}/100`
                      : '';
                  }

                  const IconComp = icon;

                  return (
                    <div
                      key={index}
                      className="flex items-center justify-between rounded-2xl border border-gray-100 dark:border-gray-700/60 bg-white/60 dark:bg-gray-800/70 px-3 py-2"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`p-2 rounded-xl flex items-center justify-center ${colorClasses}`}>
                          <IconComp className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {title}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {details || 'Activity recorded'}
                          </p>
                        </div>
                      </div>
                      <p className="text-xs text-gray-400 ml-2 whitespace-nowrap">
                        {formatDate(entry.createdAt)}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          {/* Smart recommendation */}
          <Card variant="glass" className="flex flex-col justify-between">
            <div className="mb-4">
              <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-2">
                <Brain className="h-4 w-4 text-purple-500" /> Next Best Action
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                {recommendation}
              </p>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                // Simple CTA based on recommendation priority
                if (resumeReadiness !== null && resumeReadiness < 70) {
                  navigate('/resume-upload');
                } else if (notesCoverage.percentage !== null && notesCoverage.percentage < 60) {
                  navigate('/notes-generator');
                } else if (sgpaTrend.latest && sgpaTrend.latest.value < 8) {
                  navigate('/sgpa-calculator');
                } else {
                  navigate('/study-planner');
                }
              }}
            >
              Start now
            </Button>
          </Card>
        </div>

        {/* Quick links */}
        <div className="flex flex-wrap gap-3 justify-end">
          <button
            onClick={() => navigate('/profile')}
            className="inline-flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
          >
            <User className="h-4 w-4" />
            Profile & settings
          </button>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
