import { useState, useEffect } from 'react';
import { FileText, BookOpen, Calculator, Clock, ChevronRight } from 'lucide-react';
import Card from '../components/Card';
import { historyApi } from '../api';

const tabs = [
  { id: 'resume', label: 'Resume Analyses', icon: FileText },
  { id: 'notes', label: 'Generated Notes', icon: BookOpen },
  { id: 'sgpa', label: 'SGPA Calculations', icon: Calculator },
];

function History() {
  const [activeTab, setActiveTab] = useState('resume');
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchHistory();
  }, [activeTab]);

  const fetchHistory = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await historyApi.getAll(activeTab);
      
      if (response.data.success) {
        setHistory(response.data.data);
      } else {
        throw new Error(response.data.error || 'Failed to fetch history');
      }
    } catch (err) {
      console.error('Error:', err);
      setError(err.response?.data?.error || err.message || 'Failed to load history');
      setHistory([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Unknown date';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderHistoryItem = (item) => {
    switch (activeTab) {
      case 'resume':
        return (
          <Card key={item.id} className="hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FileText className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">Resume Analysis</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-1">
                    <Clock className="h-3 w-3" />
                    {formatDate(item.createdAt)}
                  </p>
                  {item.analysis && (
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                        {item.analysis.overallScore}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">/ 100</span>
                    </div>
                  )}
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </div>
          </Card>
        );

      case 'notes':
        return (
          <Card key={item.id} className="hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <BookOpen className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    {item.notes?.title || item.fileName || 'Generated Notes'}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-1">
                    <Clock className="h-3 w-3" />
                    {formatDate(item.createdAt)}
                  </p>
                  {item.notes && (
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 line-clamp-2">
                      {item.notes.summary?.substring(0, 150)}...
                    </p>
                  )}
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </div>
          </Card>
        );

      case 'sgpa':
        return (
          <Card key={item.id} className="hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Calculator className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">SGPA Calculation</h3>
                  <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                    <Clock className="h-3 w-3" />
                    {formatDate(item.createdAt)}
                  </p>
                  <div className="mt-2 flex items-center gap-4">
                    <div>
                      <span className="text-2xl font-bold text-green-600">{item.sgpa}</span>
                      <span className="text-sm text-gray-500"> / 10</span>
                    </div>
                    <div className="text-sm text-gray-500">
                      {item.breakdown?.length} subjects • {item.totalCredits} credits
                    </div>
                  </div>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </div>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">History</h2>
        <p className="text-gray-600 dark:text-gray-300 mt-1">View your past analyses and calculations</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-600 border-t-transparent"></div>
        </div>
      ) : error ? (
        <Card className="text-center py-8">
          <p className="text-red-600 dark:text-red-400">{error}</p>
          <button
            onClick={fetchHistory}
            className="mt-4 text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium"
          >
            Try Again
          </button>
        </Card>
      ) : history.length === 0 ? (
        <Card className="text-center py-12">
          <div className="inline-flex p-3 bg-gray-100 dark:bg-gray-700 rounded-full mb-4">
            {activeTab === 'resume' && <FileText className="h-8 w-8 text-gray-400 dark:text-gray-500" />}
            {activeTab === 'notes' && <BookOpen className="h-8 w-8 text-gray-400 dark:text-gray-500" />}
            {activeTab === 'sgpa' && <Calculator className="h-8 w-8 text-gray-400 dark:text-gray-500" />}
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">No history yet</h3>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {activeTab === 'resume' && 'Upload and analyze a resume to see it here'}
            {activeTab === 'notes' && 'Generate notes from your content to see them here'}
            {activeTab === 'sgpa' && 'Calculate your SGPA to see the history here'}
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {history.map(renderHistoryItem)}
        </div>
      )}
    </div>
  );
}

export default History;
