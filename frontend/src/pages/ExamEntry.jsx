import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { examApi } from '../api/examApi.js';
import { licenseApi } from '../api/licenseApi.js';
import CandidateForm from '../components/exam/CandidateForm.jsx';
import CandidatePreview from '../components/exam/CandidatePreview.jsx';
import Loading from '../components/Loading.jsx';
import '../styles/exam.css';

const names = ['Nguyễn Văn An', 'Trần Minh Khang', 'Lê Hoàng Nam', 'Phạm Quốc Bảo', 'Đỗ Thanh Bình', 'Võ Anh Tuấn'];
const addresses = ['TP. Hồ Chí Minh', 'Hà Nội', 'Đà Nẵng', 'Cần Thơ', 'Bình Dương', 'Đồng Nai'];

const emptyCandidate = {
  unit: 'Trung tâm sát hạch GPLX',
  course: 'K2026',
  examNumber: '',
  licenseType: 'A1',
  fullName: '',
  birthday: '',
  identityNumber: '',
  address: ''
};

const randomCandidate = (current, licenses) => {
  const year = 1975 + Math.floor(Math.random() * 28);
  const month = String(1 + Math.floor(Math.random() * 12)).padStart(2, '0');
  const day = String(1 + Math.floor(Math.random() * 28)).padStart(2, '0');
  const license = current.licenseType || licenses[Math.floor(Math.random() * licenses.length)]?.code || 'A1';

  return {
    ...current,
    examNumber: String(1 + Math.floor(Math.random() * 999)).padStart(3, '0'),
    licenseType: license,
    fullName: names[Math.floor(Math.random() * names.length)],
    birthday: `${year}-${month}-${day}`,
    identityNumber: `0${Math.floor(10000000000 + Math.random() * 89999999999)}`,
    address: addresses[Math.floor(Math.random() * addresses.length)]
  };
};

const ExamEntry = () => {
  const navigate = useNavigate();
  const { licenseType } = useParams();
  const [licenses, setLicenses] = useState([]);
  const [examSets, setExamSets] = useState([]);
  const [candidate, setCandidate] = useState(emptyCandidate);
  const [mode, setMode] = useState('random');
  const [selectedSetId, setSelectedSetId] = useState('');
  const [checked, setChecked] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [loading, setLoading] = useState(true);
  const [setsLoading, setSetsLoading] = useState(false);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState('');
  const startingRef = useRef(false);

  useEffect(() => {
    let active = true;
    licenseApi.getLicenses()
      .then((items) => {
        if (!active) return;
        setLicenses(items);
        const routeLicense = licenseType ? String(licenseType).toUpperCase() : '';
        const first = items.find((item) => item.code === routeLicense) || items.find((item) => item.code === 'A1') || items[0];
        setCandidate((prev) => ({ ...prev, licenseType: first?.code || 'A1' }));
      })
      .catch((err) => {
        if (active) setError(err.message || 'Không tải được danh sách hạng GPLX.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [licenseType]);

  useEffect(() => {
    if (!candidate.licenseType) return undefined;
    let active = true;
    setSetsLoading(true);
    examApi.getExamSets(candidate.licenseType)
      .then((payload) => {
        if (!active) return;
        const sets = payload.data || [];
        setExamSets(sets);
        setSelectedSetId(sets[0]?.id || '');
      })
      .catch((err) => {
        if (!active) return;
        setExamSets([]);
        setSelectedSetId('');
        setError(err.message || 'Không tải được bộ đề cố định.');
      })
      .finally(() => {
        if (active) setSetsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [candidate.licenseType]);

  const updateCandidate = (key, value) => {
    setCandidate((prev) => ({ ...prev, [key]: value }));
    setChecked(false);
    setError('');
  };

  const checkCandidate = () => {
    const required = ['examNumber', 'licenseType', 'fullName', 'birthday', 'identityNumber', 'address'];
    const valid = required.every((key) => String(candidate[key] || '').trim());
    setChecked(valid);
    setError(valid ? '' : 'Vui lòng nhập đủ thông tin thí sinh trước khi bắt đầu thi.');
  };

  const canStartExam = checked && !setsLoading && (mode !== 'fixed' || Boolean(selectedSetId));

  const startExam = async () => {
    if (!canStartExam || startingRef.current) return;
    startingRef.current = true;
    setStarting(true);
    setError('');

    try {
      sessionStorage.removeItem('gplx_exam_session');
      sessionStorage.removeItem('gplx_exam_answers');
      sessionStorage.removeItem('gplx_exam_remaining');
      sessionStorage.removeItem('gplx_exam_result');
    } catch (err) {
      // Ignore storage errors.
    }

    try {
      const payload = await examApi.createExamSession({
        licenseType: candidate.licenseType,
        mode,
        setId: mode === 'fixed' ? selectedSetId : null,
        candidate
      });
      sessionStorage.setItem('gplx_exam_session', JSON.stringify(payload));
      sessionStorage.setItem('gplx_exam_answers', JSON.stringify({}));
      navigate(`/exam/${candidate.licenseType}/session`);
    } catch (err) {
      setError(err.message || 'Không thể bắt đầu bài thi. Vui lòng thử lại.');
    } finally {
      startingRef.current = false;
      setStarting(false);
    }
  };

  if (loading) return <Loading text="Đang tải màn hình thi thử..." />;

  return (
    <section className="exam-entry-shell">
      <div className="exam-entry-header">PHẦN MỀM TỰ LUYỆN SÁT HẠCH LÝ THUYẾT MỚI NHẤT 2026</div>
      <div className="exam-entry-banner">TỰ LUYỆN SÁT HẠCH LÝ THUYẾT</div>
      <div className="exam-entry-body">
        <CandidateForm
          candidate={candidate}
          licenses={licenses}
          examSets={examSets}
          mode={mode}
          setMode={(value) => {
            setMode(value);
            setError('');
          }}
          selectedSetId={selectedSetId}
          setSelectedSetId={(value) => {
            setSelectedSetId(value);
            setError('');
          }}
          onChange={updateCandidate}
          onRandomize={() => {
            setCandidate((prev) => randomCandidate(prev, licenses));
            setChecked(false);
            setError('');
          }}
        />
        {setsLoading && <p className="exam-inline-note">Đang tải bộ đề cố định...</p>}
        {error && <p className="exam-error-message">{error}</p>}
        <div className="candidate-actions">
          <button className="exam-button" type="button" onClick={checkCandidate}>Kiểm tra thông tin thí sinh</button>
          <button className="exam-button" type="button" onClick={() => setShowGuide(true)}>Hướng dẫn</button>
          <button className="exam-button" type="button" onClick={() => {
            setCandidate(emptyCandidate);
            setChecked(false);
            setError('');
          }}>Làm mới thông tin</button>
          <button className="exam-button primary" type="button" disabled={!canStartExam || starting} onClick={startExam}>
            {starting ? 'Đang tạo đề...' : 'Bắt đầu thi'}
          </button>
        </div>
        {checked && <CandidatePreview candidate={candidate} />}
      </div>
      {showGuide && (
        <div className="exam-modal-backdrop">
          <div className="exam-modal">
            <h2>Hướng dẫn phím tắt</h2>
            <p>Khi thi thật, bạn hãy kiểm tra thông tin thí sinh trước khi bắt đầu thi.</p>
            <p>Phím mũi tên để di chuyển câu hỏi. Phím 1, 2, 3, 4 để chọn hoặc bỏ chọn đáp án.</p>
            <p>Enter hoặc Esc để mở xác nhận kết thúc bài thi. Sau khi kết thúc có thể xem đáp án.</p>
            <button className="btn primary" type="button" onClick={() => setShowGuide(false)}>Đã hiểu</button>
          </div>
        </div>
      )}
    </section>
  );
};

export default ExamEntry;
