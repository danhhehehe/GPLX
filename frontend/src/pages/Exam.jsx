import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { licenseApi } from '../api/licenseApi.js';
import AnswerOption from '../components/AnswerOption.jsx';
import ExamTimer from '../components/ExamTimer.jsx';
import LicenseClassGrid from '../components/LicenseClassGrid.jsx';
import Loading from '../components/Loading.jsx';
import QuestionImage from '../components/QuestionImage.jsx';
import { useExam } from '../hooks/useExam.js';
import { answerStats, optionEntries } from '../utils/examUtils.js';

const ExamChooser = () => {
  const [licenses, setLicenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    licenseApi.getLicenses()
      .then((items) => {
        setLicenses(items);
        setSelected(items.find((item) => item.code === 'B') || items[0] || null);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading text="Đang tải hạng bằng lái..." />;

  return (
    <section className="container page-stack">
      <div className="page-heading">
        <p className="eyebrow">Thi thử</p>
        <h1>Chọn hạng bằng lái trước khi bắt đầu.</h1>
      </div>
      <LicenseClassGrid licenses={licenses} selectedCode={selected?.code} onSelect={setSelected} />
      {selected && (
        <div className="license-actions">
          <div>
            <h2>{selected.code} - {selected.name}</h2>
            <p>{selected.questionCount || 25} câu, đạt {selected.passingScore || 21}, thời gian {selected.durationMinutes || 19} phút.</p>
          </div>
          <Link className="btn primary" to={`/exam/${selected.code}`}>Bắt đầu thi</Link>
        </div>
      )}
    </section>
  );
};

const ExamRunner = ({ activeLicense }) => {
  const navigate = useNavigate();
  const {
    exam,
    questions,
    currentQuestion,
    currentIndex,
    setCurrentIndex,
    answers,
    chooseAnswer,
    submit,
    loading,
    submitting,
    error
  } = useExam(activeLicense);

  const finishExam = useCallback(async () => {
    const result = await submit();
    if (result) navigate('/result', { state: { result } });
  }, [navigate, submit]);

  if (loading) return <Loading text="Đang tạo đề thi..." />;
  if (error) return <div className="container alert error">{error}</div>;
  if (!currentQuestion) return <div className="container empty">Chưa tạo được đề thi cho hạng {activeLicense}. Hãy chạy seed dữ liệu.</div>;

  const stats = answerStats(questions, answers);

  return (
    <section className="container exam-layout">
      <div className="exam-main">
        <div className="exam-bar">
          <div>
            <p className="eyebrow">Thi thử {activeLicense}</p>
            <h1>Câu {currentIndex + 1} / {questions.length}</h1>
          </div>
          <ExamTimer minutes={exam.durationMinutes} onTimeout={finishExam} />
        </div>
        <article className="study-panel">
          <div className="question-meta">
            <span>{currentQuestion.category}</span>
            {currentQuestion.isPointDeduction && <strong>Câu điểm liệt</strong>}
          </div>
          <h2>{currentQuestion.question}</h2>
          <QuestionImage src={currentQuestion.imageUrl || currentQuestion.image} alt="Hình minh họa câu hỏi" />
          <div className="answer-list">
            {optionEntries(currentQuestion.options).map(([key, value]) => (
              <AnswerOption
                key={key}
                label={key}
                text={value}
                selected={answers[currentQuestion._id] === key}
                onChoose={() => chooseAnswer(currentQuestion._id, key)}
              />
            ))}
          </div>
        </article>
        <div className="pager-actions">
          <button className="btn" disabled={currentIndex === 0} onClick={() => setCurrentIndex(currentIndex - 1)}>Câu trước</button>
          <button className="btn" disabled={currentIndex === questions.length - 1} onClick={() => setCurrentIndex(currentIndex + 1)}>Câu sau</button>
          <button className="btn primary" disabled={submitting} onClick={finishExam}>Nộp bài</button>
        </div>
      </div>
      <aside className="exam-sidebar">
        <strong>{stats.answered} đã làm</strong>
        <span>{stats.unanswered} chưa làm</span>
        <div className="question-dots">
          {questions.map((question, idx) => (
            <button
              key={question._id}
              className={`${idx === currentIndex ? 'active' : ''} ${answers[question._id] ? 'done' : ''}`}
              onClick={() => setCurrentIndex(idx)}
            >
              {idx + 1}
            </button>
          ))}
        </div>
      </aside>
    </section>
  );
};

const Exam = () => {
  const { licenseType } = useParams();
  const activeLicense = (licenseType || '').toUpperCase();

  if (!activeLicense) return <ExamChooser />;
  return <ExamRunner activeLicense={activeLicense} />;
};

export default Exam;
