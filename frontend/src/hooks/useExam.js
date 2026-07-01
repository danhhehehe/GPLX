import { useEffect, useMemo, useRef, useState } from 'react';
import { examApi } from '../api/examApi.js';

export const useExam = (licenseType = 'A1') => {
  const [exam, setExam] = useState(null);
  const [answers, setAnswers] = useState({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const submittingRef = useRef(false);

  useEffect(() => {
    let active = true;
    examApi.getExam(licenseType)
      .then((payload) => active && setExam(payload))
      .catch((err) => active && setError(err.message))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [licenseType]);

  const questions = exam?.questions || [];
  const currentQuestion = questions[currentIndex];

  const answerList = useMemo(() => questions.map((question) => ({
    questionId: question._id,
    answer: answers[question._id] || ''
  })), [answers, questions]);

  const chooseAnswer = (questionId, answer) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));
  };

  const submit = async () => {
    if (submittingRef.current) return null;
    submittingRef.current = true;
    setSubmitting(true);
    setError('');
    try {
      const payload = await examApi.submit(answerList, licenseType);
      setResult(payload);
      return payload;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  };

  return {
    exam,
    questions,
    currentQuestion,
    currentIndex,
    setCurrentIndex,
    answers,
    chooseAnswer,
    submit,
    result,
    loading,
    submitting,
    error
  };
};
