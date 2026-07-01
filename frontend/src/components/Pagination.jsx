const Pagination = ({ pagination, onPageChange }) => {
  if (!pagination || pagination.totalPages <= 1) return null;

  return (
    <div className="pagination">
      <button disabled={pagination.page <= 1} onClick={() => onPageChange(pagination.page - 1)}>
        Trước
      </button>
      <span>Trang {pagination.page} / {pagination.totalPages}</span>
      <button disabled={pagination.page >= pagination.totalPages} onClick={() => onPageChange(pagination.page + 1)}>
        Sau
      </button>
    </div>
  );
};

export default Pagination;
