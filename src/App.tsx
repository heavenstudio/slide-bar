import { BrowserRouter, Routes, Route } from 'react-router';
import Dashboard from './pages/Dashboard';
import Player from './pages/Player';
import Settings from './pages/Settings';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/player" element={<Player />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
