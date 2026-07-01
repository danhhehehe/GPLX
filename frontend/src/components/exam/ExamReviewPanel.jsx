const ExamReviewPanel = ({ result }) => (
  <div className="exam-review-panel">
    <b>Xem đáp án</b>
    <span>Xanh: đúng</span>
    <span>Đỏ: sai</span>
    <span>Vàng: chưa trả lời</span>
    {result?.result?.hasWrongPointDeduction && <strong>Có câu điểm liệt bị sai.</strong>}
  </div>
);

export default ExamReviewPanel;
