import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { memoryTipsSections } from '../../data/memoryTipsData.js';

const importantKeywords = [
  'Bị nghiêm cấm',
  '35m',
  '55m',
  '70m',
  '100m',
  'Hạng A1',
  'Hạng B',
  '60km/h',
  '50km/h'
];

const renderWithKeywords = (text) => {
  const pattern = new RegExp(`(${importantKeywords.map((keyword) => keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'g');
  return String(text).split(pattern).map((part, index) => (
    importantKeywords.includes(part)
      ? <strong className="memory-tips-keyword" key={`${part}-${index}`}>{part}</strong>
      : part
  ));
};

const MemoryTipsPage = () => {
  const [openSections, setOpenSections] = useState([0]);

  const sections = useMemo(() => memoryTipsSections, []);

  const toggleSection = (index) => {
    setOpenSections((current) => (
      current.includes(index)
        ? current.filter((item) => item !== index)
        : [...current, index]
    ));
  };

  return (
    <section className="memory-tips-page-shell">
      <div className="memory-tips-modal" role="dialog" aria-labelledby="memory-tips-title">
        <header className="memory-tips-header">
          <div>
            <p className="eyebrow">Mẹo ghi nhớ</p>
            <h1 id="memory-tips-title">🧠 Mẹo ghi nhớ 600 câu hỏi ôn thi GPLX</h1>
          </div>
          <Link className="memory-tips-close" to="/" aria-label="Đóng mẹo ghi nhớ">
            Đóng
          </Link>
        </header>

        <div className="memory-tips-content">
          <p className="memory-tips-summary">
            Tổng hợp các quy tắc, mẹo nhớ nhanh và nội dung hay gặp trong bộ 600 câu hỏi GPLX.
          </p>

          <div className="memory-tips-body">
            {sections.map((section, index) => {
              const isOpen = openSections.includes(index);
              return (
                <article className={isOpen ? 'memory-tips-section open' : 'memory-tips-section'} key={section.title}>
                  <button
                    className="memory-tips-section-button"
                    type="button"
                    aria-expanded={isOpen}
                    onClick={() => toggleSection(index)}
                  >
                    <span>{index + 1}. {section.title}</span>
                    <span className="memory-tips-chevron" aria-hidden="true">{isOpen ? '−' : '+'}</span>
                  </button>

                  <div className="memory-tips-section-panel">
                    <div className="memory-tips-section-content">
                      {section.content && <p>{renderWithKeywords(section.content)}</p>}
                      {section.items && (
                        <ul className="memory-tips-list">
                          {section.items.map((item) => (
                            <li key={item}>{renderWithKeywords(item)}</li>
                          ))}
                        </ul>
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

export default MemoryTipsPage;
