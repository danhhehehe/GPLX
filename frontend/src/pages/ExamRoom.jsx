import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { examApi } from '../api/examApi.js';
import ExamAnswerSheet from '../components/exam/ExamAnswerSheet.jsx';
import ExamFinishModal from '../components/exam/ExamFinishModal.jsx';
import ExamQuestionPanel from '../components/exam/ExamQuestionPanel.jsx';
import ExamTimer from '../components/exam/ExamTimer.jsx';
import Loading from '../components/Loading.jsx';
import '../styles/exam.css';

const ExamRoom = () => {
  const navigate = useNavigate();
  const { licenseType } = useParams();
  const [session, setSession] = useState(null);
  const [answers, setAnswers] = useState({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [remainingSeconds, setRemainingSeconds] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const submittingRef = useRef(false);

  useEffect(() => {
    const saved = sessionStorage.getItem('gplx_exam_session');
    const savedAnswers = sessionStorage.getItem('gplx_exam_answers');
    if (!saved) {
      if (window.confirm('Không tìm thấy phiên thi. Bạn muốn quay lại màn hình tạo thông tin?')) navigate('/exam');
      return;
    }
    const parsed = JSON.parse(saved);
    setSession(parsed);
    setAnswers(savedAnswers ? JSON.parse(savedAnswers) : {});
    // Robust initial remaining seconds: prefer stored value, fallback to session duration, then default 19 minutes
    const stored = sessionStorage.getItem('gplx_exam_remaining');
    const durationFromSession = Number(parsed?.durationMinutes) ? Number(parsed.durationMinutes) * 60 : null;
    let initialSeconds = null;
    if (stored !== null && stored !== undefined) {
      const n = Number(stored);
      initialSeconds = Number.isFinite(n) ? n : null;
    }
    if (initialSeconds === null) initialSeconds = Number.isFinite(durationFromSession) ? durationFromSession : 19 * 60;
    setRemainingSeconds(initialSeconds);
  }, [navigate]);

  useEffect(() => {
    if (remainingSeconds === null || submitting) return undefined;
    if (remainingSeconds <= 0) return undefined; // do not start when already zero

    const timer = window.setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev === null) return prev;
        if (prev <= 1) {
          // reached zero: stop and open confirm
          setConfirmOpen(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [remainingSeconds, submitting]);

  // persist remainingSeconds to sessionStorage whenever it changes (number)
  useEffect(() => {
    if (remainingSeconds === null) return;
    sessionStorage.setItem('gplx_exam_remaining', String(remainingSeconds));
  }, [remainingSeconds]);

  const questions = session?.questions || [];
  const currentQuestion = questions[currentIndex];
  const currentAnswer = answers[currentQuestion?._id] || [];
  const progress = questions.length ? (Object.keys(answers).filter((key) => answers[key]?.length).length / questions.length) * 100 : 0;

  const toggleQuestionAnswer = useCallback((question, key) => {
    if (!question) return;
    setAnswers((prev) => {
      const current = prev[question._id] || [];
      const next = question.isMultipleChoice
        ? (current.includes(key) ? current.filter((item) => item !== key) : [...current, key])
        : (current.includes(key) ? [] : [key]);
      const updated = { ...prev, [question._id]: next };
      sessionStorage.setItem('gplx_exam_answers', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const toggleAnswer = useCallback((key) => {
    toggleQuestionAnswer(currentQuestion, key);
  }, [currentQuestion, toggleQuestionAnswer]);

  const toggleAnswerFromSheet = useCallback((questionIndex, key) => {
    setCurrentIndex(questionIndex);
    toggleQuestionAnswer(questions[questionIndex], key);
  }, [questions, toggleQuestionAnswer]);

  useEffect(() => {
    const handler = (event) => {
      if (['1', '2', '3', '4'].includes(event.key)) toggleAnswer(['a', 'b', 'c', 'd'][Number(event.key) - 1]);
      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') setCurrentIndex((value) => Math.min(value + 1, questions.length - 1));
      if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') setCurrentIndex((value) => Math.max(value - 1, 0));
      if (event.key === 'Enter' || event.key === 'Escape') setConfirmOpen(true);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [questions.length, toggleAnswer]);

  const submit = async () => {
    if (!session || submittingRef.current) return;
    submittingRef.current = true;
    setSubmitting(true);
    try {
      const payload = await examApi.submitExam({
        sessionId: session.sessionId,
        candidate: session.candidate,
        licenseType: session.licenseType || licenseType,
        setId: session.setId,
        answers: questions.map((question) => ({
          questionId: question._id,
          selectedAnswer: answers[question._id] || []
        }))
      });
      sessionStorage.setItem('gplx_exam_result', JSON.stringify({ session, answers, result: payload }));
      navigate('/exam/result');
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  };

  if (!session || !currentQuestion) return <Loading text="Đang mở phòng thi..." />;

  return (
    <section className="exam-room-shell">
      <div className="exam-room-layout">
        <main className="exam-main-panel">
          <ExamQuestionPanel question={currentQuestion} selected={currentAnswer} onToggle={toggleAnswer} />
        </main>

        <aside className="exam-sidebar">
          <ExamTimer seconds={remainingSeconds} />
          <ExamAnswerSheet
            questions={questions}
            answers={answers}
            currentQuestionIndex={currentIndex}
            onSelectQuestion={setCurrentIndex}
            onToggleAnswer={toggleAnswerFromSheet}
          />
          <button className="exam-finish-button" type="button" disabled={submitting} onClick={() => setConfirmOpen(true)}>
            KẾT THÚC THI
          </button>
        </aside>
      </div>

      <div className="exam-bottom-bar">
        <div className="candidate-mini-card">
          <b>{session.candidate.fullName}</b>
          <span>SBD: {session.candidate.examNumber} • Hạng {session.candidate.licenseType}</span>
        </div>
        <div className="exam-progress"><span style={{ width: `${progress}%` }} /></div>
      </div>

      <ExamFinishModal open={confirmOpen} submitting={submitting} onCancel={() => setConfirmOpen(false)} onConfirm={submit} />
    </section>
  );
};

export default ExamRoom;
