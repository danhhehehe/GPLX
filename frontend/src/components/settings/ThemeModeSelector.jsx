const ThemeModeSelector = ({ value, onChange }) => (
  <div className="settings-field">
    <label>Chế độ giao diện</label>
    <div className="settings-radio-row">
      <label>
        <input type="radio" name="mode" checked={value === 'light'} onChange={() => onChange('light')} />
        Sáng
      </label>
      <label>
        <input type="radio" name="mode" checked={value === 'dark'} onChange={() => onChange('dark')} />
        Tối
      </label>
    </div>
  </div>
);

export default ThemeModeSelector;
