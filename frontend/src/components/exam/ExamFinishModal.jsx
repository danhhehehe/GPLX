const ExamFinishModal = ({ open, submitting, onCancel, onConfirm }) => {
  if (!open) return null;

  return (
    <div className="exam-modal-backdrop">
      <div className="exam-modal">
        <h2>Kết thúc bài thi?</h2>
        <p>Bạn có chắc muốn kết thúc bài thi và chấm điểm không?</p>
        <div className="actions">
          <button className="btn" type="button" onClick={onCancel}>Tiếp tục làm bài</button>
          <button className="btn primary" type="button" disabled={submitting} onClick={onConfirm}>Kết thúc và chấm điểm</button>
        </div>
      </div>
    </div>
  );
};

export default ExamFinishModal;
