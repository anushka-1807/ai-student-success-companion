import { useState } from 'react';
import { Calculator, Plus, Trash2, Sparkles } from 'lucide-react';
import Card from '../components/Card';
import Button from '../components/Button';
import { sgpaApi } from '../api';

const initialSubject = { name: '', marks: '', credits: '' };

function SGPACalculator() {
  const [subjects, setSubjects] = useState([{ ...initialSubject }]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const addSubject = () => {
    setSubjects([...subjects, { ...initialSubject }]);
  };

  const removeSubject = (index) => {
    if (subjects.length > 1) {
      setSubjects(subjects.filter((_, i) => i !== index));
    }
  };

  const updateSubject = (index, field, value) => {
    const updated = [...subjects];
    updated[index][field] = value;
    setSubjects(updated);
  };

  const handleCalculate = async () => {
    // Validate inputs
    const validSubjects = subjects.filter(s => s.marks !== '' && s.credits !== '');
    
    if (validSubjects.length === 0) {
      setError('Please enter marks and credits for at least one subject');
      return;
    }

    const formattedSubjects = validSubjects.map((s, i) => ({
      name: s.name || `Subject ${i + 1}`,
      marks: parseFloat(s.marks),
      credits: parseFloat(s.credits),
    }));

    // Check for invalid values
    for (const s of formattedSubjects) {
      if (isNaN(s.marks) || s.marks < 0 || s.marks > 100) {
        setError(`Invalid marks for ${s.name}. Must be between 0 and 100.`);
        return;
      }
      if (isNaN(s.credits) || s.credits <= 0) {
        setError(`Invalid credits for ${s.name}. Must be a positive number.`);
        return;
      }
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await sgpaApi.calculate(formattedSubjects);
      
      if (!response.data.success) {
        throw new Error(response.data.error || 'Calculation failed');
      }

      setResult(response.data.data);
    } catch (err) {
      console.error('Error:', err);
      setError(err.response?.data?.error || err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const getGradeColor = (grade) => {
    const colors = {
      'O': 'text-green-600 bg-green-100',
      'A+': 'text-green-600 bg-green-100',
      'A': 'text-blue-600 bg-blue-100',
      'B+': 'text-blue-600 bg-blue-100',
      'B': 'text-yellow-600 bg-yellow-100',
      'C': 'text-orange-600 bg-orange-100',
      'P': 'text-orange-600 bg-orange-100',
      'F': 'text-red-600 bg-red-100',
    };
    return colors[grade] || 'text-gray-600 bg-gray-100';
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="mb-6">
        <div className="text-center mb-6">
          <div className="inline-flex p-3 rounded-xl bg-gradient-to-r from-green-500 to-blue-600 mb-4">
            <Calculator className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">SGPA Calculator</h2>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Enter your marks and credits to calculate your SGPA
          </p>
        </div>

        {/* Subject Inputs */}
        <div className="space-y-4">
          {subjects.map((subject, index) => (
            <div key={index} className="flex gap-3 items-start">
              <div className="flex-1 grid grid-cols-3 gap-3">
                <input
                  type="text"
                  placeholder="Subject name"
                  value={subject.name}
                  onChange={(e) => updateSubject(index, 'name', e.target.value)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <input
                  type="number"
                  placeholder="Marks (0-100)"
                  min="0"
                  max="100"
                  value={subject.marks}
                  onChange={(e) => updateSubject(index, 'marks', e.target.value)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <input
                  type="number"
                  placeholder="Credits"
                  min="0"
                  step="0.5"
                  value={subject.credits}
                  onChange={(e) => updateSubject(index, 'credits', e.target.value)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <button
                onClick={() => removeSubject(index)}
                disabled={subjects.length === 1}
                className="p-2 text-gray-400 hover:text-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </div>
          ))}
        </div>

        <button
          onClick={addSubject}
          className="mt-4 flex items-center gap-2 text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium"
        >
          <Plus className="h-5 w-5" />
          Add Subject
        </button>

        {error && (
          <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400">
            {error}
          </div>
        )}

        <div className="mt-6 flex justify-center">
          <Button
            onClick={handleCalculate}
            loading={loading}
            size="lg"
          >
            <Sparkles className="h-5 w-5 mr-2" />
            Calculate SGPA
          </Button>
        </div>

        {/* Grade Scale Reference */}
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <h3 className="font-medium text-gray-900 dark:text-white mb-3">Grade Scale:</h3>
          <div className="grid grid-cols-4 md:grid-cols-8 gap-2 text-sm">
            {[
              { range: '90+', grade: 'O', gp: 10 },
              { range: '80-89', grade: 'A+', gp: 9 },
              { range: '70-79', grade: 'A', gp: 8 },
              { range: '60-69', grade: 'B+', gp: 7 },
              { range: '50-59', grade: 'B', gp: 6 },
              { range: '45-49', grade: 'C', gp: 5 },
              { range: '40-44', grade: 'P', gp: 4 },
              { range: '<40', grade: 'F', gp: 0 },
            ].map((item) => (
              <div key={item.grade} className="text-center p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="font-medium text-gray-900 dark:text-white">{item.grade}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">{item.range}</div>
                <div className="text-xs text-gray-400 dark:text-gray-500">GP: {item.gp}</div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Results */}
      {result && (
        <Card>
          <div className="text-center mb-6">
            <p className="text-gray-600 mb-2">Your SGPA</p>
            <div className="text-6xl font-bold text-primary-600">{result.sgpa}</div>
            <p className="text-sm text-gray-500 mt-2">out of 10.0</p>
          </div>

          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <p className="text-sm text-gray-600">Total Credits</p>
              <p className="text-2xl font-bold text-gray-900">{result.totalCredits}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <p className="text-sm text-gray-600">Weighted Sum (Σ Ci × Gi)</p>
              <p className="text-2xl font-bold text-gray-900">{result.weightedSum}</p>
            </div>
          </div>

          <h3 className="font-medium text-gray-900 mb-3">Subject Breakdown</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-3">Subject</th>
                  <th className="text-center py-2 px-3">Marks</th>
                  <th className="text-center py-2 px-3">Grade</th>
                  <th className="text-center py-2 px-3">GP</th>
                  <th className="text-center py-2 px-3">Credits</th>
                  <th className="text-center py-2 px-3">C × G</th>
                </tr>
              </thead>
              <tbody>
                {result.breakdown.map((item, index) => (
                  <tr key={index} className="border-b last:border-0">
                    <td className="py-3 px-3 font-medium">{item.name}</td>
                    <td className="py-3 px-3 text-center">{item.marks}</td>
                    <td className="py-3 px-3 text-center">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getGradeColor(item.grade)}`}>
                        {item.grade}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">{item.gradePoint}</td>
                    <td className="py-3 px-3 text-center">{item.credits}</td>
                    <td className="py-3 px-3 text-center font-medium">{item.creditPoints}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 p-4 bg-primary-50 rounded-lg">
            <p className="text-sm text-primary-800">
              <strong>Formula:</strong> {result.formula}
            </p>
            <p className="text-sm text-primary-700 mt-1">
              SGPA = {result.weightedSum} / {result.totalCredits} = <strong>{result.sgpa}</strong>
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}

export default SGPACalculator;
