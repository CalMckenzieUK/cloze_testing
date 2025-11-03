import React, { useState } from 'react';
import { CheckCircle, XCircle, RotateCcw } from 'lucide-react';

export default function ClozeTestApp() {
  const [stage, setStage] = useState('input'); // input, testing, results
  const [rawText, setRawText] = useState('');
  const [nthWord, setNthWord] = useState(5);
  const [words, setWords] = useState([]);
  const [blanks, setBlanks] = useState([]);
  const [currentBlankIndex, setCurrentBlankIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState([]);
  const [currentGuess, setCurrentGuess] = useState('');

  const startTest = () => {
    if (!rawText.trim()) return;

    // Split text into words and punctuation separately
    const tokens = rawText.trim().split(/(\s+)/);
    const wordArray = [];
    const punctuationArray = [];
    
    tokens.forEach(token => {
      if (token.trim()) {
        // Separate word from surrounding punctuation
        const match = token.match(/^([^\w]*)(\w+)([^\w]*)$/);
        if (match) {
          const [, leading, word, trailing] = match;
          wordArray.push(word);
          punctuationArray.push({ leading, trailing });
        } else if (/\w/.test(token)) {
          // Fallback for words without clear punctuation pattern
          wordArray.push(token);
          punctuationArray.push({ leading: '', trailing: '' });
        }
      }
    });

    const blankIndices = [];
    
    // Mark every nth word as a blank
    for (let i = nthWord - 1; i < wordArray.length; i += nthWord) {
      blankIndices.push(i);
    }

    setWords(wordArray);
    setPunctuation(punctuationArray);
    setBlanks(blankIndices);
    setUserAnswers(new Array(blankIndices.length).fill(''));
    setCurrentBlankIndex(0);
    setStage('testing');
  };

  const submitGuess = () => {
    const newAnswers = [...userAnswers];
    newAnswers[currentBlankIndex] = currentGuess.trim();
    setUserAnswers(newAnswers);
    setCurrentGuess('');

    if (currentBlankIndex < blanks.length - 1) {
      setCurrentBlankIndex(currentBlankIndex + 1);
    } else {
      setStage('results');
    }
  };

  const calculateResults = () => {
    let correct = 0;
    blanks.forEach((blankIdx, i) => {
      const original = words[blankIdx].toLowerCase().replace(/[.,!?;:]/g, '');
      const answer = userAnswers[i].toLowerCase().replace(/[.,!?;:]/g, '');
      if (original === answer) correct++;
    });
    return {
      correct,
      total: blanks.length,
      percentage: Math.round((correct / blanks.length) * 100)
    };
  };

  const reset = () => {
    setStage('input');
    setRawText('');
    setCurrentGuess('');
    setCurrentBlankIndex(0);
  };

  const renderWord = (word, index) => {
    const blankIndex = blanks.indexOf(index);
    
    if (blankIndex === -1) {
      return <span key={index}>{word} </span>;
    }

    if (stage === 'testing') {
      const isCurrentBlank = blankIndex === currentBlankIndex;
      return (
        <span
          key={index}
          className={`inline-block px-2 py-1 mx-1 border-b-2 min-w-[80px] text-center ${
            isCurrentBlank
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-400 bg-gray-50'
          }`}
        >
          {isCurrentBlank ? '?' : userAnswers[blankIndex] || '_____'}
        </span>
      );
    }

    if (stage === 'results') {
      const original = word.toLowerCase().replace(/[.,!?;:]/g, '');
      const answer = userAnswers[blankIndex].toLowerCase().replace(/[.,!?;:]/g, '');
      const isCorrect = original === answer;

      return (
        <span key={index} className="inline-block mx-1">
          <span
            className={`px-2 py-1 rounded ${
              isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}
          >
            {word}
          </span>
          {!isCorrect && userAnswers[blankIndex] && (
            <span className="text-xs text-red-600 ml-1">
              ({userAnswers[blankIndex]})
            </span>
          )}
        </span>
      );
    }
  };

  if (stage === 'input') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
        <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Cloze Test Generator</h1>
          <p className="text-gray-600 mb-6">
            Test text readability by removing every nth word and checking comprehension.
          </p>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Paste your text:
            </label>
            <textarea
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              className="w-full h-48 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Paste the text you want to test here..."
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Remove every nth word:
            </label>
            <input
              type="number"
              min="2"
              max="10"
              value={nthWord}
              onChange={(e) => setNthWord(parseInt(e.target.value) || 5)}
              className="w-32 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <button
            onClick={startTest}
            disabled={!rawText.trim()}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
          >
            Start Test
          </button>
        </div>
      </div>
    );
  }

  if (stage === 'testing') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-800">Fill in the Blanks</h2>
              <span className="text-sm text-gray-600">
                Blank {currentBlankIndex + 1} of {blanks.length}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{ width: `${((currentBlankIndex + 1) / blanks.length) * 100}%` }}
              />
            </div>
          </div>

          <div className="bg-gray-50 p-6 rounded-lg mb-6 text-lg leading-relaxed">
            {words.map((word, index) => renderWord(word, index))}
          </div>

          <div className="flex gap-4">
            <input
              type="text"
              value={currentGuess}
              onChange={(e) => setCurrentGuess(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && currentGuess.trim() && submitGuess()}
              className="flex-1 p-3 border-2 border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
              placeholder="Type your guess for the highlighted blank..."
              autoFocus
            />
            <button
              onClick={submitGuess}
              disabled={!currentGuess.trim()}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
            >
              {currentBlankIndex < blanks.length - 1 ? 'Next' : 'Finish'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (stage === 'results') {
    const results = calculateResults();
    const passed = results.percentage >= 60;

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Test Results</h2>
            <div className={`inline-flex items-center gap-3 px-6 py-3 rounded-lg text-2xl font-bold ${
              passed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {passed ? <CheckCircle size={32} /> : <XCircle size={32} />}
              <span>{results.percentage}%</span>
            </div>
            <p className="mt-4 text-gray-600">
              {results.correct} out of {results.total} correct
            </p>
            <p className={`mt-2 font-semibold ${passed ? 'text-green-700' : 'text-red-700'}`}>
              {passed
                ? '✓ Text passed - Readability is acceptable'
                : '✗ Text needs revision - Consider simplifying the content'}
            </p>
          </div>

          <div className="bg-gray-50 p-6 rounded-lg mb-6">
            <h3 className="font-semibold text-gray-800 mb-4">Answer Key:</h3>
            <div className="text-lg leading-relaxed">
              {words.map((word, index) => renderWord(word, index))}
            </div>
          </div>

          <button
            onClick={reset}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition flex items-center justify-center gap-2"
          >
            <RotateCcw size={20} />
            Start New Test
          </button>
        </div>
      </div>
    );
  }
}
