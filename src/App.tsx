import { BrowserRouter, Routes, Route } from 'react-router';
import Dashboard from './pages/Dashboard';
import Player from './pages/Player';

function App(): JSX.Element {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/player" element={<Player />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
