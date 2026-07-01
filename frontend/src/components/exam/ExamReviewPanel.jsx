const ExamReviewPanel = ({ result }) => (
  <div className="exam-review-panel">
    <b>Xem đáp án</b>
    <span>Xanh: đúng</span>
    <span>Đỏ: đáp án đã chọn sai</span>
    <span>Vàng: câu sai hoặc chưa trả lời</span>
    <span className="review-legend-critical"><i aria-hidden="true">!</i> Câu điểm liệt</span>
    {result?.result?.hasWrongPointDeduction && <strong>Có câu điểm liệt bị sai.</strong>}
  </div>
);

export default ExamReviewPanel;
