import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { licenseApi } from '../api/licenseApi.js';
import LicenseClassGrid from '../components/LicenseClassGrid.jsx';
import Loading from '../components/Loading.jsx';

const Licenses = () => {
  const [licenses, setLicenses] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    licenseApi.getLicenses()
      .then((items) => {
        setLicenses(items);
        setSelected(items[0] || null);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="container page-stack">
      <div className="page-heading">
        <p className="eyebrow">Hạng bằng lái</p>
        <h1>Chọn hạng GPLX để ôn tập và thi thử.</h1>
      </div>
      {loading && <Loading />}
      {error && <div className="alert error">{error}</div>}
      {!loading && !error && (
        <>
          <LicenseClassGrid licenses={licenses} selectedCode={selected?.code} onSelect={setSelected} />
          {selected && (
            <div className="license-actions">
              <div>
                <h2>{selected.code} - {selected.name}</h2>
                <p>{selected.description || selected.vehicleType}</p>
                {selected.requirements?.length > 0 && (
                  <p className="license-meta">Điều kiện: {selected.requirements.join(', ')}</p>
                )}
              </div>
              <div className="actions">
                <Link className="btn primary" to={`/exam/${selected.code}`}>Thi thử hạng này</Link>
                <Link className="btn" to={`/questions?licenseType=${selected.code}`}>Xem câu hỏi hạng này</Link>
                <Link className="btn" to={`/point-deduction?licenseType=${selected.code}`}>Câu điểm liệt</Link>
              </div>
            </div>
          )}
        </>
      )}
    </section>
  );
};

export default Licenses;
