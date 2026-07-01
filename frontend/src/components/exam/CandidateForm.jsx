const CandidateForm = ({
  candidate,
  licenses,
  examSets,
  mode,
  setMode,
  selectedSetId,
  setSelectedSetId,
  onChange,
  onRandomize
}) => {
  const selectedLicense = licenses.find((license) => license.code === candidate.licenseType);

  return (
    <div className="candidate-form">
      <div className="form-grid">
        <label>Don vi<input value={candidate.unit} onChange={(event) => onChange('unit', event.target.value)} /></label>
        <label>Khoa<input value={candidate.course} onChange={(event) => onChange('course', event.target.value)} /></label>
        <label>So bao danh<input value={candidate.examNumber} onChange={(event) => onChange('examNumber', event.target.value)} /></label>
        <label>Hang GPLX
          <select value={candidate.licenseType} onChange={(event) => onChange('licenseType', event.target.value)}>
            {licenses.map((license) => <option key={license.code} value={license.code}>{license.code} - {license.name}</option>)}
          </select>
        </label>
        <label>Kieu de
          <select value={mode} onChange={(event) => setMode(event.target.value)}>
            <option value="random">Ngau nhien</option>
            <option value="fixed">Bo de co dinh</option>
          </select>
        </label>
        {mode === 'fixed' && (
          <label>Bo de co dinh
            <select value={selectedSetId} onChange={(event) => setSelectedSetId(event.target.value)}>
              {examSets.map((set) => <option key={set.id} value={set.id}>{set.name}</option>)}
            </select>
          </label>
        )}
        <label>Loai GPLX<input value={candidate.licenseType} readOnly /></label>
        <label>So cau<input value={selectedLicense?.questionCount ? `${selectedLicense.questionCount} cau` : ''} readOnly /></label>
        <label>Thoi gian<input value={selectedLicense?.durationMinutes ? `${selectedLicense.durationMinutes} phut` : ''} readOnly /></label>
        <label>Diem dat<input value={selectedLicense?.passingScore && selectedLicense?.questionCount ? `${selectedLicense.passingScore}/${selectedLicense.questionCount}` : ''} readOnly /></label>
        <label>Cau diem liet<input value="1 cau trong de" readOnly /></label>
        <label>Ho ten<input value={candidate.fullName} onChange={(event) => onChange('fullName', event.target.value)} /></label>
        <label>Ngay sinh<input type="date" value={candidate.birthday} onChange={(event) => onChange('birthday', event.target.value)} /></label>
        <label>So CMT/CCCD<input value={candidate.identityNumber} onChange={(event) => onChange('identityNumber', event.target.value)} /></label>
        <label className="wide">Dia chi<input value={candidate.address} onChange={(event) => onChange('address', event.target.value)} /></label>
      </div>
      <div className="candidate-photo">Anh thi sinh</div>
      <div className="candidate-actions">
        <button className="exam-button" type="button" onClick={onRandomize}>Tao ngau nhien</button>
      </div>
    </div>
  );
};

export default CandidateForm;
