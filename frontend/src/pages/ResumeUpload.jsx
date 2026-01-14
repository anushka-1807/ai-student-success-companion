import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Sparkles } from 'lucide-react';
import Card from '../components/Card';
import Button from '../components/Button';
import FileUpload from '../components/FileUpload';
import { resumeApi } from '../api';

function ResumeUpload() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const [error, setError] = useState('');

  const handleAnalyze = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }

    setLoading(true);
    setError('');

    try {
      setUploadProgress('Uploading resume...');
      const uploadResponse = await resumeApi.upload(file);
      
      if (!uploadResponse.data.success) {
        throw new Error(uploadResponse.data.error || 'Upload failed');
      }

      setUploadProgress('Analyzing with AI...');
      const analyzeResponse = await resumeApi.analyze(uploadResponse.data.data.id);
      
      if (!analyzeResponse.data.success) {
        throw new Error(analyzeResponse.data.error || 'Analysis failed');
      }

      // Navigate to report page with analysis data
      navigate('/resume-report', { 
        state: { 
          analysis: analyzeResponse.data.data.analysis,
          fileName: file.name 
        } 
      });
    } catch (err) {
      console.error('Error:', err);
      setError(err.response?.data?.error || err.message || 'Something went wrong');
    } finally {
      setLoading(false);
      setUploadProgress('');
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-4">
            <FileText className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">AI Resume Analyzer</h2>
          <p className="text-gray-600 dark:text-gray-300">
            Upload your resume and get AI-powered feedback with detailed analysis, 
            scores, and improvement suggestions.
          </p>
        </div>

        <FileUpload
          accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          onFileSelect={setFile}
          label="Upload your resume"
          description="PDF or DOCX files up to 10MB"
          maxSize={10}
        />

        {error && (
          <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400">
            {error}
          </div>
        )}

        {uploadProgress && (
          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg text-blue-700 dark:text-blue-400 flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 dark:border-blue-400 border-t-transparent"></div>
            {uploadProgress}
          </div>
        )}

        <div className="mt-6 flex justify-center">
          <Button
            onClick={handleAnalyze}
            disabled={!file || loading}
            loading={loading}
            size="lg"
          >
            <Sparkles className="h-5 w-5 mr-2" />
            Analyze Resume
          </Button>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <h3 className="font-medium text-gray-900 dark:text-white mb-3">What you'll get:</h3>
          <ul className="grid md:grid-cols-2 gap-3 text-sm text-gray-600 dark:text-gray-300">
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2"></span>
              Overall resume score out of 100
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2"></span>
              Category scores (format, clarity, skills)
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2"></span>
              Keyword recommendations for ATS
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2"></span>
              Section-wise improvement suggestions
            </li>
          </ul>
        </div>
      </Card>
    </div>
  );
}

export default ResumeUpload;
