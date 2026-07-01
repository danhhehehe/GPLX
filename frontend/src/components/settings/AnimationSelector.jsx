const AnimationSelector = ({ value, onChange }) => (
  <div className="settings-field">
    <label>Hiệu ứng</label>
    <select value={value} onChange={(event) => onChange(event.target.value)}>
      <option value="off">Tắt hiệu ứng</option>
      <option value="soft">Hiệu ứng nhẹ</option>
      <option value="normal">Bình thường</option>
      <option value="strong">Nổi bật</option>
    </select>
  </div>
);

export default AnimationSelector;
