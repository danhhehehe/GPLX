import React from 'react';
import './memoryModal.css';
import MemoryTipsList from './MemoryTipsList.jsx';
import { memoryTips } from '../../data/memoryTips.js';

const MemoryTipsModal = ({ open, onClose }) => {
  if (!open) return null;
  return (
    <div className="memory-modal-backdrop" role="dialog" aria-modal="true">
      <div className="memory-modal">
        <div className="memory-modal-header">
          <h3>🧠 Mẹo ghi nhớ</h3>
          <button onClick={onClose} aria-label="Đóng">✕</button>
        </div>
        <div className="memory-modal-body">
          <MemoryTipsList tips={memoryTips} />
        </div>
      </div>
    </div>
  );
};

export default MemoryTipsModal;
