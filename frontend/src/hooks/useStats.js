import { useState, useEffect } from 'react';

export const useStats = () => {
  const [stats, setStats] = useState({
    resumesAnalyzed: 0,
    notesGenerated: 0,
    sgpaCalculations: 0
  });

  const updateStats = (type) => {
    setStats(prev => {
      const newStats = {
        ...prev,
        [type]: prev[type] + 1
      };
      localStorage.setItem('userStats', JSON.stringify(newStats));
      return newStats;
    });
  };

  const loadStats = () => {
    const savedStats = localStorage.getItem('userStats');
    if (savedStats) {
      try {
        setStats(JSON.parse(savedStats));
      } catch (error) {
        console.error('Error loading stats:', error);
      }
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  return { stats, updateStats, loadStats };
};
