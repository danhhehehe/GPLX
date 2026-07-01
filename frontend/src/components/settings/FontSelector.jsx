const FONTS = [
  { label: 'Mặc định', value: 'Inter, Arial, sans-serif' },
  { label: 'Arial', value: 'Arial, Helvetica, sans-serif' },
  { label: 'Roboto', value: 'Roboto, Arial, sans-serif' },
  { label: 'Inter', value: 'Inter, Arial, sans-serif' },
  { label: 'Times New Roman', value: '"Times New Roman", Times, serif' },
  { label: 'Tahoma', value: 'Tahoma, Geneva, sans-serif' }
];

const FontSelector = ({ value, onChange }) => (
  <div className="settings-field">
    <label>Font chữ</label>
    <select value={value} onChange={(event) => onChange(event.target.value)}>
      {FONTS.map((font) => <option key={font.value} value={font.value}>{font.label}</option>)}
    </select>
  </div>
);

export default FontSelector;
