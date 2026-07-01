const PreviewCard = () => (
  <div className="preview-stack">
    <div className="app-card">
      <h4>Ví dụ câu hỏi</h4>
      <p>1. Đây là nội dung câu hỏi mẫu để xem trước giao diện.</p>
      <div className="preview-actions">
        <button className="btn" type="button">Chọn đáp án A</button>
        <button className="btn secondary" type="button">Bỏ qua</button>
      </div>
    </div>
    <div className="app-card">
      <label>Input</label>
      <input className="preview-input" placeholder="Chữ mẫu" />
    </div>
    <div className="app-card">
      <h4>Biển báo mẫu</h4>
      <div className="preview-sign">🚦</div>
    </div>
  </div>
);

export default PreviewCard;
