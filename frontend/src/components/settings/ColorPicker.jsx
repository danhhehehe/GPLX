const PRESETS = [
  { name: 'Xanh dương', value: 'var(--preset-blue)', className: 'blue' },
  { name: 'Xanh lá', value: 'var(--preset-green)', className: 'green' },
  { name: 'Tím', value: 'var(--preset-purple)', className: 'purple' },
  { name: 'Đỏ', value: 'var(--preset-red)', className: 'red' },
  { name: 'Cam', value: 'var(--preset-orange)', className: 'orange' },
  { name: 'Hồng', value: 'var(--preset-pink)', className: 'pink' }
];

const ColorPicker = ({ value, onChange }) => (
  <div className="settings-field">
    <label>Màu chủ đạo</label>
    <div className="settings-swatch-row">
      {PRESETS.map((preset) => (
        <button
          key={preset.value}
          aria-label={preset.name}
          title={preset.name}
          type="button"
          onClick={() => onChange(preset.value)}
          className={`color-swatch ${preset.className} ${value === preset.value ? 'active' : ''}`}
        />
      ))}
      <input
        className="color-input"
        type="color"
        value={value?.startsWith('var(') ? '#2563eb' : value}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  </div>
);

export default ColorPicker;
