import React from 'react';

const MemoryTipSearch = ({ value, onChange }) => (
  <div className="memory-search">
    <input className="preview-input" placeholder="Tìm mẹo (tiêu đề hoặc nội dung...)" value={value} onChange={e=>onChange(e.target.value)} />
  </div>
);

export default MemoryTipSearch;
