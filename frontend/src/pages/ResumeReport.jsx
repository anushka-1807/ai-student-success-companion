import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, CheckCircle, AlertCircle, Lightbulb } from 'lucide-react';
import Card from '../components/Card';
import Button from '../components/Button';
import ScoreCircle from '../components/ScoreCircle';

function ResumeReport() {
  const location = useLocation();
  const navigate = useNavigate();
  const { analysis, fileName } = location.state || {};

  if (!analysis) {
    return (
      <div className="max-w-3xl mx-auto text-center py-12">
        <p className="text-gray-600 mb-4">No analysis data found.</p>
        <Button onClick={() => navigate('/resume-upload')}>
          Upload a Resume
        </Button>
      </div>
    );
  }

  const categoryLabels = {
    format: 'Format',
    clarity: 'Clarity',
    achievements: 'Achievements',
    skills: 'Skills',
    keywords: 'Keywords',
  };

  return (
    <div className="max-w-4xl mx-auto">
      <button
        onClick={() => navigate('/resume-upload')}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Upload
      </button>

      {/* Header */}
      <Card className="mb-6">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <ScoreCircle score={analysis.overallScore} size="lg" />
          <div className="text-center md:text-left">
            <h2 className="text-2xl font-bold text-gray-900">Resume Analysis Report</h2>
            <p className="text-gray-600 mt-1">{fileName}</p>
            <p className="text-sm text-gray-500 mt-2">{analysis.overallFeedback}</p>
          </div>
        </div>
      </Card>

      {/* Category Scores */}
      <Card className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Category Scores</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {analysis.categoryScores && Object.entries(analysis.categoryScores).map(([key, score]) => (
            <ScoreCircle 
              key={key} 
              score={score} 
              size="sm" 
              label={categoryLabels[key] || key} 
            />
          ))}
        </div>
      </Card>

      {/* Strengths & Areas for Improvement */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <h3 className="text-lg font-semibold text-gray-900">Strengths</h3>
          </div>
          <ul className="space-y-2">
            {analysis.strengths?.map((strength, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
                {strength}
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="h-5 w-5 text-orange-500" />
            <h3 className="text-lg font-semibold text-gray-900">Areas for Improvement</h3>
          </div>
          <ul className="space-y-2">
            {analysis.areasForImprovement?.map((area, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
                <span className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 flex-shrink-0"></span>
                {area}
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {/* Keyword Recommendations */}
      <Card className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Lightbulb className="h-5 w-5 text-yellow-500" />
          <h3 className="text-lg font-semibold text-gray-900">Recommended Keywords</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {analysis.keywordRecommendations?.map((keyword, index) => (
            <span 
              key={index}
              className="px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-sm font-medium"
            >
              {keyword}
            </span>
          ))}
        </div>
      </Card>

      {/* Section Feedback */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Section-wise Feedback</h3>
        <div className="space-y-6">
          {analysis.sectionFeedback && Object.entries(analysis.sectionFeedback).map(([section, data]) => (
            <div key={section} className="border-b pb-4 last:border-0 last:pb-0">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900 capitalize">{section}</h4>
                <span className={`px-2 py-1 rounded text-sm font-medium ${
                  data.score >= 70 ? 'bg-green-100 text-green-700' :
                  data.score >= 50 ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {data.score}/100
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-2">{data.feedback}</p>
              {data.suggestions && data.suggestions.length > 0 && (
                <div className="mt-2">
                  <p className="text-xs font-medium text-gray-500 mb-1">Suggestions:</p>
                  <ul className="space-y-1">
                    {data.suggestions.map((suggestion, index) => (
                      <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                        <span className="text-primary-500">•</span>
                        {suggestion}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>

      <div className="mt-6 flex justify-center">
        <Button onClick={() => navigate('/resume-upload')} variant="outline">
          Analyze Another Resume
        </Button>
      </div>
    </div>
  );
}

export default ResumeReport;
