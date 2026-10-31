import { Navigate, Route, Routes } from 'react-router';
import Header from './components/Header.jsx';
import Lobby from './pages/Lobby.jsx';
import Room from './pages/Room.jsx';

export default function App() {
  return (
    <div className="app">
      <Header />
      <main className="main">
        <Routes>
          <Route path="/" element={<Lobby />} />
          <Route path="/room/:slug" element={<Room />} />
          <Route path="/room/:slug/:photoId" element={<Room />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}
