import { useState } from 'react';
import { BookOpen, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import Card from '../components/Card';
import Button from '../components/Button';
import FileUpload from '../components/FileUpload';
import { notesApi } from '../api';

function NotesGenerator() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notes, setNotes] = useState(null);
  const [expandedSections, setExpandedSections] = useState({
    summary: true,
    keyPoints: true,
    definitions: false,
    concepts: false,
    quiz: false,
    flashcards: false,
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleGenerate = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }

    setLoading(true);
    setError('');
    setNotes(null);

    try {
      const response = await notesApi.generate(file);
      
      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to generate notes');
      }

      setNotes(response.data.data.notes);
    } catch (err) {
      console.error('Error:', err);
      setError(err.response?.data?.error || err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const SectionHeader = ({ title, section, count }) => (
    <button
      onClick={() => toggleSection(section)}
      className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
    >
      <span className="font-medium text-gray-900 dark:text-white">
        {title} {count !== undefined && <span className="text-gray-500 dark:text-gray-400">({count})</span>}
      </span>
      {expandedSections[section] ? (
        <ChevronUp className="h-5 w-5 text-gray-500 dark:text-gray-400" />
      ) : (
        <ChevronDown className="h-5 w-5 text-gray-500 dark:text-gray-400" />
      )}
    </button>
  );

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="mb-6">
        <div className="text-center mb-6">
          <div className="inline-flex p-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-600 mb-4">
            <BookOpen className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">AI Notes Generator</h2>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Upload audio, PDF, PPT, or images to generate structured study notes
          </p>
        </div>

        <FileUpload
          accept=".pdf,.pptx,.jpg,.jpeg,.png,.webp,.mp3,.wav,.webm,.m4a,audio/*,image/*"
          onFileSelect={setFile}
          label="Upload your content"
          description="Audio, PDF, PPT, or image files up to 50MB"
          maxSize={50}
        />

        {error && (
          <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400">
            {error}
          </div>
        )}

        <div className="mt-6 flex justify-center">
          <Button
            onClick={handleGenerate}
            disabled={!file || loading}
            loading={loading}
            size="lg"
          >
            <Sparkles className="h-5 w-5 mr-2" />
            {loading ? 'Generating Notes...' : 'Generate Notes'}
          </Button>
        </div>
      </Card>

      {notes && (
        <div className="space-y-4">
          {/* Title */}
          {notes.title && (
            <Card>
              <h3 className="text-xl font-bold text-gray-900">{notes.title}</h3>
            </Card>
          )}

          {/* Summary */}
          <Card>
            <SectionHeader title="Summary" section="summary" />
            {expandedSections.summary && (
              <div className="mt-4 text-gray-700 leading-relaxed whitespace-pre-wrap">
                {notes.summary}
              </div>
            )}
          </Card>

          {/* Key Points */}
          {notes.keyPoints && notes.keyPoints.length > 0 && (
            <Card>
              <SectionHeader title="Key Points" section="keyPoints" count={notes.keyPoints.length} />
              {expandedSections.keyPoints && (
                <ul className="mt-4 space-y-3">
                  {notes.keyPoints.map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </span>
                      <div>
                        <p className="font-medium text-gray-900">{item.point}</p>
                        {item.explanation && (
                          <p className="text-sm text-gray-600 mt-1">{item.explanation}</p>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          )}

          {/* Definitions */}
          {notes.definitions && notes.definitions.length > 0 && (
            <Card>
              <SectionHeader title="Definitions" section="definitions" count={notes.definitions.length} />
              {expandedSections.definitions && (
                <dl className="mt-4 space-y-4">
                  {notes.definitions.map((item, index) => (
                    <div key={index} className="border-l-4 border-purple-500 pl-4">
                      <dt className="font-medium text-gray-900">{item.term}</dt>
                      <dd className="text-gray-600 mt-1">{item.definition}</dd>
                    </div>
                  ))}
                </dl>
              )}
            </Card>
          )}

          {/* Concepts */}
          {notes.concepts && notes.concepts.length > 0 && (
            <Card>
              <SectionHeader title="Concepts" section="concepts" count={notes.concepts.length} />
              {expandedSections.concepts && (
                <div className="mt-4 space-y-4">
                  {notes.concepts.map((item, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900">{item.concept}</h4>
                      <p className="text-gray-600 mt-1">{item.description}</p>
                      {item.examples && item.examples.length > 0 && (
                        <div className="mt-2">
                          <p className="text-sm font-medium text-gray-500">Examples:</p>
                          <ul className="mt-1 space-y-1">
                            {item.examples.map((example, i) => (
                              <li key={i} className="text-sm text-gray-600">• {example}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </Card>
          )}

          {/* Quiz Questions */}
          {notes.quizQuestions && notes.quizQuestions.length > 0 && (
            <Card>
              <SectionHeader title="Quiz Questions" section="quiz" count={notes.quizQuestions.length} />
              {expandedSections.quiz && (
                <div className="mt-4 space-y-6">
                  {notes.quizQuestions.map((q, index) => (
                    <QuizQuestion key={index} question={q} index={index} />
                  ))}
                </div>
              )}
            </Card>
          )}

          {/* Flashcards */}
          {notes.flashcards && notes.flashcards.length > 0 && (
            <Card>
              <SectionHeader title="Flashcards" section="flashcards" count={notes.flashcards.length} />
              {expandedSections.flashcards && (
                <div className="mt-4 grid md:grid-cols-2 gap-4">
                  {notes.flashcards.map((card, index) => (
                    <FlashCard key={index} card={card} />
                  ))}
                </div>
              )}
            </Card>
          )}

          {/* Study Tips */}
          {notes.studyTips && notes.studyTips.length > 0 && (
            <Card>
              <h3 className="font-medium text-gray-900 mb-3">Study Tips</h3>
              <ul className="space-y-2">
                {notes.studyTips.map((tip, index) => (
                  <li key={index} className="flex items-start gap-2 text-gray-600">
                    <span className="text-purple-500">💡</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

function QuizQuestion({ question, index }) {
  const [showAnswer, setShowAnswer] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);

  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <p className="font-medium text-gray-900 mb-3">
        {index + 1}. {question.question}
      </p>
      <div className="space-y-2">
        {question.options?.map((option, i) => (
          <button
            key={i}
            onClick={() => {
              setSelectedOption(i);
              setShowAnswer(true);
            }}
            className={`w-full text-left p-3 rounded-lg border transition-colors ${
              showAnswer
                ? i === question.correctAnswer
                  ? 'bg-green-100 border-green-500 text-green-800'
                  : selectedOption === i
                  ? 'bg-red-100 border-red-500 text-red-800'
                  : 'bg-white border-gray-200'
                : 'bg-white border-gray-200 hover:border-purple-300'
            }`}
          >
            {String.fromCharCode(65 + i)}. {option}
          </button>
        ))}
      </div>
      {showAnswer && question.explanation && (
        <p className="mt-3 text-sm text-gray-600 bg-white p-3 rounded-lg">
          <strong>Explanation:</strong> {question.explanation}
        </p>
      )}
    </div>
  );
}

function FlashCard({ card }) {
  const [flipped, setFlipped] = useState(false);

  return (
    <div
      onClick={() => setFlipped(!flipped)}
      className="cursor-pointer bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl p-6 min-h-[150px] flex items-center justify-center text-center transition-transform hover:scale-105"
    >
      <p className="font-medium">
        {flipped ? card.back : card.front}
      </p>
    </div>
  );
}

export default NotesGenerator;
