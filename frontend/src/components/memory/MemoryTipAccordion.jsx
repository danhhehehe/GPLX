import React from 'react';

const renderContent = (content) => {
  if (content.type === 'text') return <p className="content-block">{content.value}</p>;
  if (content.type === 'list') return (
    <ul className="content-block">
      {content.items.map((it, idx) => <li key={idx}>{it}</li>)}
    </ul>
  );
  return null;
};

const MemoryTipAccordion = ({ tip, isOpen, onToggle }) => {
  return (
    <div className={`memory-section ${isOpen ? 'open' : ''}`}>
      <button className="memory-header" onClick={() => onToggle(tip.id)}>
        <div style={{display:'flex',alignItems:'center',gap:12}}>
          <span className="memory-index">{tip.id}</span>
          <strong>{tip.title}</strong>
        </div>
        <span className="chev">{isOpen ? '▾' : '▸'}</span>
      </button>
      {isOpen && (
        <div className="memory-content">
          {tip.content.map((c, i) => <div key={i}>{renderContent(c)}</div>)}
        </div>
      )}
    </div>
  );
};

export default MemoryTipAccordion;
