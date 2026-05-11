import { useContext, useState, useEffect, useRef } from 'react';
import { GameContext } from '../context/GameContext';
import './QuizPage.css';
import cutSound from '../assets/cut.MP3';
import winSound from '../assets/win.MP3';

export const QuizPage = ({ onNavigate }) => {
  const { currentDay, questionsAnsweredToday, answerQuestion } = useContext(GameContext);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);
  const [finishedHouse, setFinishedHouse] = useState('');
  const [treeChopProgress, setTreeChopProgress] = useState(questionsAnsweredToday / 20);
  const inputRef = useRef(null);

  const playCut = () => {
    const audio = new Audio(cutSound);
    audio.currentTime = 0;
    audio.play().catch(() => {});
  };

  const playWin = () => {
    const audio = new Audio(winSound);
    audio.currentTime = 0;
    audio.play().catch(() => {});
  };

  // Generate a random question
  const generateQuestion = () => {
    const tables = [3, 4];
    const table = tables[Math.floor(Math.random() * tables.length)];
    const multiplier = Math.floor(Math.random() * 11);
    const answer = table * multiplier;
    
    return {
      question: `${table} × ${multiplier}`,
      answer,
      table,
      multiplier,
    };
  };

  useEffect(() => {
    if (quizFinished) {
      return;
    }
    setCurrentQuestion(generateQuestion());
    setUserAnswer('');
    setShowResult(false);
  }, [questionsAnsweredToday, quizFinished]);

  useEffect(() => {
    if (!showResult && inputRef.current) {
      inputRef.current.focus();
    }
  }, [questionsAnsweredToday, showResult]);

  const formatHouseName = (name) => {
    if (!name) return '';
    return name.charAt(0).toUpperCase() + name.slice(1);
  };

  const handleSubmit = () => {
    const correct = Number(userAnswer) === currentQuestion.answer;
    setIsCorrect(correct);
    setShowResult(true);

    if (correct) {
      playCut();
      // Auto advance on correct answer after short delay
      setTimeout(() => {
        handleNext();
      }, 800);
    }
  };

  const handleNext = () => {
    if (questionsAnsweredToday < 19) {
      answerQuestion();
      setTreeChopProgress((questionsAnsweredToday + 1) / 20);
    } else if (questionsAnsweredToday === 19) {
      // Last question
      const result = answerQuestion();
      setTreeChopProgress(1);
      setQuizFinished(true);
      setFinishedHouse(result.unlockedHouse || '');

      if (result.unlockedHouse) {
        playWin();
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !showResult) {
      handleSubmit();
    }
  };

  if (!currentQuestion) return <div>Loading...</div>;

  const dayComplete = quizFinished;
  const treeTopCy = 90 - (treeChopProgress * 55);
  const treeTopRy = 70 - (treeChopProgress * 50);
  const trunkTopY = treeTopCy + treeTopRy - 2;
  const trunkHeight = 220 - trunkTopY;

  return (
    <div className="quiz-page">
      <div className="quiz-container">
        <div className="quiz-header-top">
          <button className="back-btn" onClick={() => onNavigate('home')}>← Back</button>
          <h2>Day {currentDay}</h2>
          <div className="quiz-counter">{dayComplete ? 20 : Math.min(questionsAnsweredToday + 1, 20)} / 20</div>
        </div>

        <div className="quiz-main">
          <div className="tree-visualization">
            <svg className="tree-svg" viewBox="0 0 200 350" width="180" height="320">
              {/* Tree top that shrinks */}
              <ellipse 
                cx="100" 
                cy={treeTopCy}
                rx={50 - (treeChopProgress * 35)}
                ry={treeTopRy}
                fill="#A8D5BA"
                opacity={1 - treeChopProgress * 0.3}
              />
              
              {/* Keep the trunk attached to the canopy as the canopy shrinks */}
              <rect 
                x="90" 
                y={trunkTopY}
                width="20" 
                height={trunkHeight}
                fill="#D4A574"
              />
              
              {/* Logs on ground */}
              {[...Array(Math.floor(questionsAnsweredToday))].map((_, i) => (
                <rect
                  key={`log-${i}`}
                  x="120"
                  y={250 + (i * 10)}
                  width="50"
                  height="8"
                  fill="#8B7355"
                  rx="2"
                  transform={`rotate(${-15 - i * 5} 145 ${250 + i * 10 + 4})`}
                />
              ))}
            </svg>
            <div className="logs-counter">Logs: {questionsAnsweredToday}</div>
          </div>

          <div className="question-card">
            {!dayComplete ? (
              <>
                <div className="question-display">
                  <p className="equation">{currentQuestion.question} = ?</p>
                </div>

                <div className="input-section">
                  <input
                    ref={inputRef}
                    type="number"
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={showResult}
                    placeholder="Type your answer"
                    className="answer-input"
                  />
                  <button
                    onClick={handleSubmit}
                    disabled={!userAnswer || showResult}
                    className="submit-btn"
                  >
                    Submit
                  </button>
                </div>

                {showResult && (
                  <div className={`result-message ${isCorrect ? 'correct' : 'incorrect'}`}>
                    {isCorrect ? (
                      <>
                        <p className="result-text">✓ Correct!</p>
                        <p className="result-sub">Great job!</p>
                      </>
                    ) : (
                      <>
                        <p className="result-text">✗ Incorrect</p>
                        <p className="result-sub">The answer is {currentQuestion.answer}</p>
                        <button
                          className="next-btn"
                          onClick={() => {
                            setShowResult(false);
                            setUserAnswer('');
                            if (inputRef.current) {
                              inputRef.current.focus();
                            }
                          }}
                        >
                          Try Again
                        </button>
                      </>
                    )}
                  </div>
                )}
              </>
            ) : (
              <div className="day-complete-card">
                <h3>{finishedHouse ? `${formatHouseName(finishedHouse)} unlocked!` : 'Day complete!'}</h3>
                <p className="complete-message">You earned 20 logs today.</p>
                <button className="btn btn-primary" onClick={() => onNavigate('home')}>
                  Go back to home
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
