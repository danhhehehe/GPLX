const ExamBottomBar = ({ candidate, progress, onFinish }) => (
  <div className="exam-bottom-bar">
    <div className="candidate-mini-card">
      <b>{candidate.fullName}</b>
      <span>SBD: {candidate.examNumber} • Hạng {candidate.licenseType}</span>
    </div>
    <div className="exam-progress"><span style={{ width: `${progress}%` }} /></div>
    <button className="exam-finish-button" type="button" onClick={onFinish}>KẾT THÚC THI</button>
  </div>
);

export default ExamBottomBar;
