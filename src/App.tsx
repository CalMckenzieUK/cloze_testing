import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, RotateCcw, Share2, Copy } from 'lucide-react';

export default function ClozeTestApp() {
  const [stage, setStage] = useState('input');
  const [rawText, setRawText] = useState('');
  const [nthWord, setNthWord] = useState(5);
  const [words, setWords] = useState([]);
  const [punctuation, setPunctuation] = useState([]);
  const [blanks, setBlanks] = useState([]);
  const [currentBlankIndex, setCurrentBlankIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState([]);
  const [currentGuess, setCurrentGuess] = useState('');
  const [shareKey, setShareKey] = useState('');

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const testId = urlParams.get('test');
    
    if (testId) {
      loadSharedTest(testId);
    }
  }, []);

  const loadSharedTest = async (testId) => {
    try {
      const result = await window.storage.get(`test:${testId}`, true);
      if (result && result.value) {
        const testData = JSON.parse(result.value);
        setWords(testData.words);
        setPunctuation(testData.punctuation);
        setBlanks(testData.blanks);
        setNthWord(testData.nthWord);
        setUserAnswers(new Array(testData.blanks.length).fill(''));
        setCurrentBlankIndex(0);
        setStage('testing');
      }
    } catch (error) {
      console.error('Error loading shared test:', error);
    }
  };

  const generateShareLink = async () => {
    if (!rawText.trim()) return;

    const tokens = rawText.trim().split(/(\s+)/);
    const wordArray = [];
    const punctuationArray = [];
    
    tokens.forEach(token => {
      if (token.trim()) {
        const match = token.match(/^([^\w]*)(\w+)([^\w]*)$/);
        if (match) {
          const [, leading, word, trailing] = match;
          wordArray.push(word);
          punctuationArray.push({ leading, trailing });
        } else if (/\w/.test(token)) {
          wordArray.push(token);
          punctuationArray.push({ leading: '', trailing: '' });
        }
      }
    });

    const blankIndices = [];
    for (let i = nthWord - 1; i < wordArray.length; i += nthWord) {
      blankIndices.push(i);
    }

    const testId = Date.now().toString(36) + Math.random().toString(36).substr(2);
    
    const testData = {
      words: wordArray,
      punctuation: punctuationArray,
      blanks: blankIndices,
      nthWord: nthWord
    };

    try {
      await window.storage.set(`test:${testId}`, JSON.stringify(testData), true);
      setShareKey(testId);
      setWords(wordArray);
      setPunctuation(punctuationArray);
      setBlanks(blankIndices);
      setStage('share');
    } catch (error) {
      console.error('Error saving test:', error);
      alert('Failed to generate share link. Please try again.');
    }
  };

  const generatePrintout = () => {
    if (!rawText.trim()) return;

    const tokens = rawText.trim().split(/(\s+)/);
    const wordArray = [];
    const punctuationArray = [];
    
    tokens.forEach(token => {
      if (token.trim()) {
        const match = token.match(/^([^\w]*)(\w+)([^\w]*)$/);
        if (match) {
          const [, leading, word, trailing] = match;
          wordArray.push(word);
          punctuationArray.push({ leading, trailing });
        } else if (/\w/.test(token)) {
          wordArray.push(token);
          punctuationArray.push({ leading: '', trailing: '' });
        }
      }
    });

    const blankIndices = [];
    for (let i = nthWord - 1; i < wordArray.length; i += nthWord) {
      blankIndices.push(i);
    }

    setWords(wordArray);
    setPunctuation(punctuationArray);
    setBlanks(blankIndices);
    setStage('printout');
  };

  const startTest = () => {
    if (!rawText.trim()) return;

    const tokens = rawText.trim().split(/(\s+)/);
    const wordArray = [];
    const punctuationArray = [];
    
    tokens.forEach(token => {
      if (token.trim()) {
        const match = token.match(/^([^\w]*)(\w+)([^\w]*)$/);
        if (match) {
          const [, leading, word, trailing] = match;
          wordArray.push(word);
          punctuationArray.push({ leading, trailing });
        } else if (/\w/.test(token)) {
          wordArray.push(token);
          punctuationArray.push({ leading: '', trailing: '' });
        }
      }
    });

    const blankIndices = [];
    
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
      const original = words[blankIdx].toLowerCase();
      const answer = userAnswers[i].toLowerCase();
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
    const punct = punctuation[index] || { leading: '', trailing: '' };
    
    if (blankIndex === -1) {
      return <span key={index}>{punct.leading}{word}{punct.trailing} </span>;
    }

    if (stage === 'testing') {
      const isCurrentBlank = blankIndex === currentBlankIndex;
      return (
        <span key={index}>
          {punct.leading}
          <span
            className={`inline-block px-2 py-1 mx-1 border-b-2 min-w-[80px] text-center ${
              isCurrentBlank
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-400 bg-gray-50'
            }`}
          >
            {isCurrentBlank ? <span className="font-bold">?</span> : userAnswers[blankIndex] || '_____'}
          </span>
          {punct.trailing}{' '}
        </span>
      );
    }

    if (stage === 'results') {
      const original = word.toLowerCase();
      const answer = userAnswers[blankIndex].toLowerCase();
      const isCorrect = original === answer;

      return (
        <span key={index}>
          {punct.leading}
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
          {punct.trailing}{' '}
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
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition mb-3"
          >
            Start Test
          </button>

          <button
            onClick={generateShareLink}
            disabled={!rawText.trim()}
            className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition mb-3 flex items-center justify-center gap-2"
          >
            <Share2 size={20} />
            Generate Shareable Link
          </button>

          <button
            onClick={generatePrintout}
            disabled={!rawText.trim()}
            className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
          >
            Generate Printout Version
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

  if (stage === 'share') {
    const shareUrl = `${window.location.origin}${window.location.pathname}?test=${shareKey}`;

    const copyLink = () => {
      navigator.clipboard.writeText(shareUrl);
      alert('Link copied to clipboard!');
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
        <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Shareable Link Generated!</h2>
          <p className="text-gray-600 mb-6">
            Share this link with test takers. When they open it, they'll go straight to the test without seeing the original text.
          </p>

          <div className="bg-gray-50 p-4 rounded-lg mb-6 break-all font-mono text-sm">
            {shareUrl}
          </div>

          <div className="flex gap-3 mb-6">
            <button
              onClick={copyLink}
              className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition flex items-center justify-center gap-2"
            >
              <Copy size={20} />
              Copy Link
            </button>
            <button
              onClick={() => setStage('testing')}
              className="flex-1 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition"
            >
              Take Test Now
            </button>
          </div>

          <button
            onClick={reset}
            className="w-full bg-gray-600 text-white py-3 rounded-lg font-semibold hover:bg-gray-700 transition flex items-center justify-center gap-2"
          >
            <RotateCcw size={20} />
            Create New Test
          </button>
        </div>
      </div>
    );
  }

  if (stage === 'printout') {
    const renderPrintoutWord = (word, index) => {
      const blankIndex = blanks.indexOf(index);
      const punct = punctuation[index] || { leading: '', trailing: '' };
      
      if (blankIndex === -1) {
        return `${punct.leading}${word}${punct.trailing}`;
      } else {
        return `${punct.leading}<blank>${punct.trailing}`;
      }
    };

    const printoutText = words.map((word, index) => renderPrintoutWord(word, index)).join(' ');

    const handlePrint = () => {
      window.print();
    };

    const handleCopy = () => {
      navigator.clipboard.writeText(printoutText);
      alert('Text copied to clipboard!');
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
          <div className="mb-6 print:hidden">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Printout Version</h2>
            <p className="text-gray-600 mb-4">
              This version has every {nthWord}th word replaced with &lt;blank&gt; and is ready to share with test takers.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handlePrint}
                className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
              >
                Print
              </button>
              <button
                onClick={handleCopy}
                className="flex-1 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition"
              >
                Copy to Clipboard
              </button>
              <button
                onClick={reset}
                className="flex-1 bg-gray-600 text-white py-3 rounded-lg font-semibold hover:bg-gray-700 transition flex items-center justify-center gap-2"
              >
                <RotateCcw size={20} />
                Back
              </button>
            </div>
          </div>

          <div className="bg-white p-8 border-2 border-gray-300 rounded-lg">
            <div className="text-lg leading-relaxed whitespace-pre-wrap font-serif">
              {printoutText}
            </div>
          </div>
        </div>
      </div>
    );
  }
}