import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import Header from './components/Header.jsx';
import AppFooter from './components/AppFooter.jsx';
import Home from './pages/Home.jsx';
import Questions from './pages/Questions.jsx';
import Practice from './pages/Practice.jsx';
import ExamEntry from './pages/ExamEntry.jsx';
import ExamRoom from './pages/ExamRoom.jsx';
import ExamResult from './pages/ExamResult.jsx';
import PointDeduction from './pages/PointDeduction.jsx';
import Result from './pages/Result.jsx';
import TrafficSigns from './pages/TrafficSigns.jsx';
import QuestionsWithImages from './pages/QuestionsWithImages.jsx';
import Statistics from './pages/Statistics.jsx';
import Licenses from './pages/Licenses.jsx';
import MemoryTips from './pages/MemoryTips.jsx';
import RoadPractice from './pages/RoadPractice.jsx';
import WrongQuestions from './pages/WrongQuestions.jsx';
import Settings from './pages/Settings.jsx';
import RoadTest from './components/road/RoadTest.jsx';
import PracticeMapModal from './components/practice-map/PracticeMapModal.jsx';
import MemoryTipsPage from './components/memory-tips/MemoryTipsPage.jsx';

const showInternalPages = import.meta.env.VITE_SHOW_INTERNAL_PAGES === 'true';

const App = () => {
  const location = useLocation();

  return (
    <div className="app-shell">
      <Header />
      <main className="main">
        <div className="page-transition" key={location.pathname}>
          <Routes location={location}>
            <Route path="/" element={<Home />} />
            <Route path="/licenses" element={<Licenses />} />
            <Route path="/questions" element={<Questions />} />
            <Route path="/questions-with-images" element={showInternalPages ? <QuestionsWithImages /> : <Navigate to="/" replace />} />
            <Route path="/practice/a1" element={<Practice />} />
            <Route path="/exam" element={<ExamEntry />} />
            <Route path="/exam/:licenseType" element={<ExamEntry />} />
            <Route path="/exam/:licenseType/session" element={<ExamRoom />} />
            <Route path="/exam/result" element={<ExamResult />} />
            <Route path="/point-deduction" element={<PointDeduction />} />
            <Route path="/wrong-questions" element={<WrongQuestions />} />
            <Route path="/duong-truong" element={<RoadTest />} />
            <Route path="/sa-hinh" element={<PracticeMapModal />} />
            <Route path="/road-practice" element={<RoadPractice mode="road" />} />
            <Route path="/simulation-practice" element={<RoadPractice mode="simulation" />} />
            <Route path="/traffic-signs" element={<TrafficSigns />} />
            <Route path="/statistics" element={showInternalPages ? <Statistics /> : <Navigate to="/" replace />} />
            <Route path="/meo-ghi-nho" element={<MemoryTipsPage />} />
            <Route path="/memory-tips" element={<MemoryTips />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/result" element={<Result />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </main>
      <AppFooter />
    </div>
  );
};

export default App;
