import React, { useMemo, useState } from 'react';
import MemoryTipAccordion from './MemoryTipAccordion.jsx';
import MemoryTipSearch from './MemoryTipSearch.jsx';

const MemoryTipsList = ({ tips }) => {
  const [query, setQuery] = useState('');
  const [openIds, setOpenIds] = useState([]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return tips;
    return tips.filter(t => t.title.toLowerCase().includes(q) || JSON.stringify(t.content).toLowerCase().includes(q));
  }, [tips, query]);

  const toggle = (id) => setOpenIds(prev => prev.includes(id) ? prev.filter(x=>x!==id) : [...prev, id]);
  const openAll = () => setOpenIds(filtered.map(t => t.id));
  const closeAll = () => setOpenIds([]);

  const copyTip = (tip) => {
    const text = [tip.title, ...tip.content.map(c => (c.type==='text' ? c.value : c.items.join('\n')))].join('\n\n');
    navigator.clipboard?.writeText(text);
    alert('Đã sao chép mẹo: ' + tip.title);
  };

  return (
    <div>
      <div className="memory-tips-toolbar">
        <MemoryTipSearch value={query} onChange={setQuery} />
        <div style={{display:'flex',gap:8,marginTop:8}}>
          <button className="btn" onClick={openAll}>Mở tất cả</button>
          <button className="btn secondary" onClick={closeAll}>Thu gọn tất cả</button>
        </div>
      </div>

      <div style={{marginTop:12}}>
        {filtered.map(tip => (
          <div key={tip.id} style={{marginBottom:8}}>
            <MemoryTipAccordion tip={tip} isOpen={openIds.includes(tip.id)} onToggle={toggle} />
            <div style={{display:'flex',gap:8,marginTop:6}}>
              <button className="btn" onClick={()=>copyTip(tip)}>Sao chép mẹo</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MemoryTipsList;
