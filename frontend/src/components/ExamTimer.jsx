import { useEffect, useState } from 'react';
import { formatTime } from '../utils/examUtils.js';

const ExamTimer = ({ minutes = 19, onTimeout }) => {
  const [seconds, setSeconds] = useState(minutes * 60);

  useEffect(() => {
    setSeconds(minutes * 60);
  }, [minutes]);

  useEffect(() => {
    if (seconds <= 0) {
      onTimeout?.();
      return undefined;
    }

    const timer = window.setTimeout(() => setSeconds((value) => value - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [seconds, onTimeout]);

  return <div className={seconds < 60 ? 'timer danger' : 'timer'}>{formatTime(seconds)}</div>;
};

export default ExamTimer;
