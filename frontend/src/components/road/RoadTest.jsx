import { useState } from 'react';
import { Link } from 'react-router-dom';
import { roadTestSections } from '../../data/roadTestData.js';

const SectionList = ({ title, items }) => (
  <div className="road-test-detail">
    <h3>{title}</h3>
    <ul>
      {items.map((item) => <li key={item}>{item}</li>)}
    </ul>
  </div>
);

const RoadTest = () => {
  const [openIndexes, setOpenIndexes] = useState([0]);

  const toggleSection = (index) => {
    setOpenIndexes((current) => (
      current.includes(index)
        ? current.filter((item) => item !== index)
        : [...current, index]
    ));
  };

  return (
    <section className="road-test-page">
      <div className="road-test-modal" role="dialog" aria-labelledby="road-test-title">
        <header className="road-test-header">
          <div>
            <p className="eyebrow">Đường trường</p>
            <h1 id="road-test-title">Sát hạch lái xe trên đường</h1>
          </div>
          <Link className="road-test-close" to="/" aria-label="Đóng nội dung đường trường">
            Đóng
          </Link>
        </header>

        <div className="road-test-intro">
          <span className="road-test-icon" aria-hidden="true">🛣️</span>
          <p>
            Luyện tình huống quan sát, thao tác số và xử lý an toàn khi sát hạch lái xe trên đường thực tế.
          </p>
        </div>

        <div className="road-test-sections">
          {roadTestSections.map((section, index) => {
            const isOpen = openIndexes.includes(index);
            return (
              <article className={isOpen ? 'road-test-section open' : 'road-test-section'} key={section.title}>
                <button
                  className="road-test-section-button"
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => toggleSection(index)}
                >
                  <span>{index + 1}. {section.title}</span>
                  <span className="road-test-chevron" aria-hidden="true">{isOpen ? '−' : '+'}</span>
                </button>

                <div className="road-test-section-panel">
                  <div className="road-test-section-content">
                    <SectionList title="Các bước thực hiện" items={section.steps} />
                    <SectionList title="Yêu cầu đạt được" items={section.requirements} />
                    <SectionList title="Các lỗi bị trừ điểm" items={section.penalties} />
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default RoadTest;
