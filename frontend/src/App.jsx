import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Logout from './components/Logout';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import Perfil from './components/Perfil';
import Editor from './components/Editor';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route exact path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
          <Route path="/logout" element={<Logout />} />
          <Route path="/perfil" element={<Perfil />} />
          <Route path="/editor" element={<Editor />} />
          <Route path="/editor/:historiaId" element={<Editor />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;