import { useTheme } from '../contexts/ThemeContext.jsx';
import ThemeModeSelector from '../components/settings/ThemeModeSelector.jsx';
import AnimationSelector from '../components/settings/AnimationSelector.jsx';
import PreviewCard from '../components/settings/PreviewCard.jsx';

const Settings = () => {
  const { theme, setTheme, motion, setMotion } = useTheme();

  return (
    <div className="container page-stack">
      <h1>Cài đặt giao diện</h1>
      <div className="settings-layout">
        <div className="settings-main">
          <ThemeModeSelector value={theme} onChange={setTheme} />
          <AnimationSelector value={motion} onChange={setMotion} />
        </div>
        <div className="settings-preview">
          <h3>Preview</h3>
          <PreviewCard />
        </div>
      </div>
    </div>
  );
};

export default Settings;
