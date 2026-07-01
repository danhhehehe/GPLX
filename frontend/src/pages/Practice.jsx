import { useState } from 'react';
import AnswerOption from '../components/AnswerOption.jsx';
import Loading from '../components/Loading.jsx';
import QuestionImage from '../components/QuestionImage.jsx';
import { useQuestions } from '../hooks/useQuestions.js';
import { optionEntries } from '../utils/examUtils.js';

const Practice = () => {
  const { data, loading, error } = useQuestions({ limit: 1000 }, 'a1');
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState('');
  const question = data[index];
  const progress = data.length ? ((index + 1) / data.length) * 100 : 0;

  const move = (nextIndex) => {
    setIndex(Math.min(Math.max(nextIndex, 0), data.length - 1));
    setSelected('');
  };

  if (loading) return <Loading />;
  if (error) return <div className="container alert error">{error}</div>;
  if (!question) return <div className="container empty">Chưa có dữ liệu A1. Hãy chạy seed trước.</div>;

  return (
    <section className="container practice-layout">
      <div className="practice-top">
        <div>
          <p className="eyebrow">Ôn tập A1</p>
          <h1>Câu {index + 1} / {data.length}</h1>
        </div>
        <div className="progress"><span style={{ width: `${progress}%` }} /></div>
      </div>
      <article className="study-panel">
        <div className="question-meta">
          <span>{question.category}</span>
          {question.isPointDeduction && <strong>Câu điểm liệt</strong>}
        </div>
        <h2>{question.question}</h2>
        <QuestionImage src={question.imageUrl || question.image} alt="Hình minh họa câu hỏi" />
        <div className="answer-list">
          {optionEntries(question.options).map(([key, value]) => (
            <AnswerOption
              key={key}
              label={key}
              text={value}
              selected={selected === key}
              correct={Boolean(selected) && key === question.correctAnswer}
              wrong={selected === key && selected !== question.correctAnswer}
              disabled={Boolean(selected)}
              onChoose={() => setSelected(key)}
            />
          ))}
        </div>
        {selected && (
          <div className={selected === question.correctAnswer ? 'alert success' : 'alert error'}>
            {selected === question.correctAnswer ? 'Chính xác.' : `Chưa đúng. Đáp án đúng là ${question.correctAnswer.toUpperCase()}.`}
            {question.explanation && <p>{question.explanation}</p>}
          </div>
        )}
      </article>
      <div className="pager-actions">
        <button className="btn" disabled={index === 0} onClick={() => move(index - 1)}>Câu trước</button>
        <button className="btn primary" disabled={index === data.length - 1} onClick={() => move(index + 1)}>Câu sau</button>
      </div>
    </section>
  );
};

export default Practice;
