import { useState } from 'react';

const TrafficSignCard = ({ sign }) => {
  const [failed, setFailed] = useState(false);

  return (
    <article className="traffic-card traffic-sign-card">
      <div className="traffic-sign-image">
        {sign.imageUrl && !failed ? (
          <img
            src={sign.imageUrl}
            alt={sign.name || sign.code}
            loading="lazy"
            onError={() => setFailed(true)}
          />
        ) : (
          <div className="image-fallback">Không tải được ảnh biển báo</div>
        )}
      </div>
      <div className="traffic-sign-content">
        <div className="traffic-code">{sign.code || 'N/A'}</div>
        <h3>{sign.name}</h3>
        <p className="traffic-group-label">{sign.group}</p>
        <p>{sign.description}</p>
      </div>
    </article>
  );
};

export default TrafficSignCard;
