import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/layout/Navbar';
import Library from './pages/Library';
import Login from './pages/Login';
import Register from './pages/Register';
import Media from './pages/Media';

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Media />} />
              <Route path="/library" element={<Library />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
            </Routes>
          </main>
          <footer className="border-t border-bg-tertiary py-6 text-center text-sm text-text-tertiary">
           made with curiosity!
          </footer>
        </div>
      </AuthProvider>
    </Router>
  );
};

export default App;
