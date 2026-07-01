import { formatTime } from '../../utils/examUtils.js';

export default function ExamTimer({ seconds }) {
  if (seconds === null || seconds === undefined) {
    return (
      <div className="exam-timer-box">
        <span>THỜI GIAN CÒN LẠI</span>
        <strong>--:--</strong>
      </div>
    );
  }

  const n = Number(seconds);
  if (!Number.isFinite(n) || n < 0) {
    return (
      <div className="exam-timer-box">
        <span>THỜI GIAN CÒN LẠI</span>
        <strong>--:--</strong>
      </div>
    );
  }

  return (
    <div className="exam-timer-box">
      <span>THỜI GIAN CÒN LẠI</span>
      <strong>{formatTime(Math.max(0, Math.floor(n)))}</strong>
    </div>
  );
}
