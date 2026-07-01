const CandidateForm = ({ candidate, licenses, examSets, mode, setMode, selectedSetId, setSelectedSetId, onChange, onRandomize }) => (
  <div className="candidate-form">
    <div className="form-grid">
      <label>Đơn vị<input value={candidate.unit} onChange={(event) => onChange('unit', event.target.value)} /></label>
      <label>Khóa<input value={candidate.course} onChange={(event) => onChange('course', event.target.value)} /></label>
      <label>Số báo danh<input value={candidate.examNumber} onChange={(event) => onChange('examNumber', event.target.value)} /></label>
      <label>Hạng GPLX
        <select value={candidate.licenseType} onChange={(event) => onChange('licenseType', event.target.value)}>
          {licenses.map((license) => <option key={license.code} value={license.code}>{license.code} - {license.name}</option>)}
        </select>
      </label>
      <label>Kiểu đề
        <select value={mode} onChange={(event) => setMode(event.target.value)}>
          <option value="random">Ngẫu nhiên</option>
          <option value="fixed">Bộ đề cố định</option>
        </select>
      </label>
      {mode === 'fixed' && (
        <label>Bộ đề cố định
          <select value={selectedSetId} onChange={(event) => setSelectedSetId(event.target.value)}>
            {examSets.map((set) => <option key={set.id} value={set.id}>{set.name}</option>)}
          </select>
        </label>
      )}
      <label>Loại GPLX<input value={candidate.licenseType} readOnly /></label>
      <label>Họ tên<input value={candidate.fullName} onChange={(event) => onChange('fullName', event.target.value)} /></label>
      <label>Ngày sinh<input type="date" value={candidate.birthday} onChange={(event) => onChange('birthday', event.target.value)} /></label>
      <label>Số CMT/CCCD<input value={candidate.identityNumber} onChange={(event) => onChange('identityNumber', event.target.value)} /></label>
      <label className="wide">Địa chỉ<input value={candidate.address} onChange={(event) => onChange('address', event.target.value)} /></label>
    </div>
    <div className="candidate-photo">Ảnh thí sinh</div>
    <div className="candidate-actions">
      <button className="exam-button" type="button" onClick={onRandomize}>Tạo ngẫu nhiên</button>
    </div>
  </div>
);

export default CandidateForm;
