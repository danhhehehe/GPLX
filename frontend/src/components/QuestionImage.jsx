import { useState } from 'react';

const QuestionImage = ({ src, alt = 'Ảnh câu hỏi GPLX' }) => {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  if (!src) return null;

  return (
    <div className="question-image-wrap">
      {!loaded && !failed && <div className="image-skeleton" />}
      {!failed && (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          className={loaded ? 'question-image loaded' : 'question-image'}
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
        />
      )}
      {failed && <div className="image-fallback">Không tải được ảnh câu hỏi</div>}
    </div>
  );
};

export default QuestionImage;
