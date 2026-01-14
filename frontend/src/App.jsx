import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ResumeUpload from './pages/ResumeUpload';
import ResumeReport from './pages/ResumeReport';
import NotesGenerator from './pages/NotesGenerator';
import SGPACalculator from './pages/SGPACalculator';
import StudyPlanner from './pages/StudyPlanner';
import SkillAnalysis from './pages/SkillAnalysis';
import History from './pages/History';
import Profile from './pages/Profile';
import Layout from './components/Layout';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
            <Route
              path="/"
              element={user ? <Layout user={user} /> : <Navigate to="/login" />}
            >
              <Route index element={<Dashboard />} />
              <Route path="resume-upload" element={<ResumeUpload />} />
              <Route path="resume-report" element={<ResumeReport />} />
              <Route path="notes-generator" element={<NotesGenerator />} />
              <Route path="sgpa-calculator" element={<SGPACalculator />} />
              <Route path="study-planner" element={<StudyPlanner />} />
              <Route path="skill-analysis" element={<SkillAnalysis />} />
              <Route path="history" element={<History />} />
              <Route path="profile" element={<Profile />} />
            </Route>
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
