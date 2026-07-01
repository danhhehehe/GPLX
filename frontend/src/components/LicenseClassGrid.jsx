import LicenseClassCard from './LicenseClassCard.jsx';

const LicenseClassGrid = ({ licenses, selectedCode, onSelect }) => (
  <div className="license-grid">
    {licenses.map((license) => (
      <LicenseClassCard
        key={license.code}
        license={license}
        active={selectedCode === license.code}
        onSelect={onSelect}
      />
    ))}
  </div>
);

export default LicenseClassGrid;
