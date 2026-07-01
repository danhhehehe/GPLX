const LicenseClassCard = ({ license, active = false, onSelect }) => (
  <button
    className={active ? 'license-card active' : 'license-card'}
    type="button"
    onClick={() => onSelect?.(license)}
  >
    <span className="license-code">{license.code}</span>
    <span className="license-info">
      <span className="license-title">{license.name}</span>
      <span className="license-description">{license.description || license.vehicleType}</span>
      <span className="license-meta">
        {license.minAge ? `Từ ${license.minAge} tuổi` : 'Theo quy định'}
        {license.questionCount ? ` • ${license.questionCount} câu thi` : ''}
        {license.passingScore ? ` • đạt ${license.passingScore}` : ''}
      </span>
    </span>
  </button>
);

export default LicenseClassCard;
