import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import WorkPage from './pages/WorkPage';
import ViewerPage from './pages/ViewerPage';

function App() {
  return (
    <BrowserRouter>
      <div className="app-container">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/works/:workId" element={<WorkPage />} />
          <Route path="/viewer/:episodeId" element={<ViewerPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
