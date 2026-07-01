import { useState } from 'react';
import { Link } from 'react-router-dom';
import { practiceMapSections } from '../../data/practiceMapData.js';

const noteClassByType = {
  tip: 'practice-map-tip',
  warning: 'practice-map-warning',
  success: 'practice-map-success'
};

const PracticeMapModal = () => {
  const [openSections, setOpenSections] = useState([0]);

  const toggleSection = (index) => {
    setOpenSections((current) => (
      current.includes(index)
        ? current.filter((item) => item !== index)
        : [...current, index]
    ));
  };

  return (
    <section className="practice-map-page">
      <div className="practice-map-modal" role="dialog" aria-labelledby="practice-map-title">
        <header className="practice-map-header">
          <div>
            <p className="eyebrow">Sa hình</p>
            <h1 id="practice-map-title">🏍️ Hướng dẫn thi thực hành lái xe số</h1>
          </div>
          <Link className="practice-map-close" to="/" aria-label="Đóng hướng dẫn sa hình">
            Đóng
          </Link>
        </header>

        <div className="practice-map-content">
          <div className="practice-map-summary">
            <span className="practice-map-icon" aria-hidden="true">🏍️</span>
            <p>
              Hướng dẫn các phần thi thực hành lái xe máy A1/A: vòng số 8, đường thẳng,
              đường ziczac, đường gồ ghề và kết thúc bài thi.
            </p>
          </div>

          <div className="practice-map-body">
            {practiceMapSections.map((section, index) => {
              const isOpen = openSections.includes(index);
              return (
                <article className={isOpen ? 'practice-map-section open' : 'practice-map-section'} key={section.title}>
                  <button
                    className="practice-map-section-button"
                    type="button"
                    aria-expanded={isOpen}
                    onClick={() => toggleSection(index)}
                  >
                    <span>{`1.${index + 1}. ${section.title}`}</span>
                    <span className="practice-map-chevron" aria-hidden="true">{isOpen ? '−' : '+'}</span>
                  </button>

                  <div className="practice-map-section-panel">
                    <div className="practice-map-section-content">
                      <p className="practice-map-description">{section.description}</p>
                      <ul className="practice-map-list">
                        {section.items.map((item) => <li key={item}>{item}</li>)}
                      </ul>
                      {section.note && (
                        <div className={noteClassByType[section.noteType] || 'practice-map-tip'}>
                          {section.note}
                        </div>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default PracticeMapModal;
