import { NavLink, Link } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext.jsx';

const Header = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="site-header">
      <div className="container nav-wrap">
        <Link className="brand" to="/">GPLX</Link>
        <nav className="nav">
          <NavLink to="/">Trang chủ</NavLink>
          <NavLink to="/questions">600 câu hỏi</NavLink>
          <NavLink to="/exam">Thi thử</NavLink>
          <NavLink to="/point-deduction">Câu điểm liệt</NavLink>
          <NavLink to="/wrong-questions">Câu đã sai</NavLink>
          <NavLink to="/traffic-signs">Biển báo</NavLink>
          <NavLink to="/licenses">Hạng bằng lái</NavLink>
          {/* <NavLink to="/memory-tips">Mẹo ghi nhớ</NavLink> */}
        </nav>
        <div className="header-actions">
          <button
            aria-label="Chuyển chế độ sáng tối"
            onClick={toggleTheme}
            className="theme-toggle-button"
            type="button"
          >
            {theme === 'dark' ? '🌙 Tối' : '☀️ Sáng'}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
