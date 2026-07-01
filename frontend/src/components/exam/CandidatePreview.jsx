const CandidatePreview = ({ candidate }) => (
  <div className="candidate-preview">
    <h3>Thông tin thí sinh đã kiểm tra</h3>
    <p><b>Họ tên:</b> {candidate.fullName}</p>
    <p><b>Số báo danh:</b> {candidate.examNumber}</p>
    <p><b>Ngày sinh:</b> {candidate.birthday}</p>
    <p><b>CCCD:</b> {candidate.identityNumber}</p>
    <p><b>Hạng GPLX:</b> {candidate.licenseType}</p>
    <p><b>Địa chỉ:</b> {candidate.address}</p>
  </div>
);

export default CandidatePreview;
