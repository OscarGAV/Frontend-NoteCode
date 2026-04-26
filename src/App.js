import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { AuthProvider, useAuth } from './services/AuthContext';
import CodeEditor from './components/CodeEditor';
import Header from './components/Header';
import LoginPage from './pages/LoginPage';
import SharePage from './pages/SharePage';
import HeroBackground from './assets/Hero-Background-notecode.svg';

// ─── Styles ───────────────────────────────────────────────────────────────────
const AppContainer = styled.div`
    min-height: 100vh;
    background:
            url(${HeroBackground}) no-repeat bottom center,
            linear-gradient(180deg, #ffffff 0%, #ffffff 65%, #8B5CF6 100%);
    background-size: cover;
    position: relative;
    overflow-x: hidden;
`;

const MainContent = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    min-height: 100vh;
    padding: 2rem 1rem;
    position: relative;
    z-index: 2;
`;

const TopBar = styled.div`
    width: 100%;
    max-width: 900px;
    display: flex;
    justify-content: flex-end;
    margin-bottom: 0.5rem;
`;

const LogoutButton = styled.button`
    background: none;
    border: 1.5px solid rgba(139, 92, 246, 0.4);
    border-radius: 6px;
    padding: 0.4rem 0.9rem;
    font-family: 'Outfit', sans-serif;
    font-size: 0.82rem;
    color: #7c3aed;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
        background: rgba(139, 92, 246, 0.08);
        border-color: #8b5cf6;
    }
`;

const UserChip = styled.span`
    font-family: 'Outfit', sans-serif;
    font-size: 0.82rem;
    color: #6b7280;
    margin-right: 0.75rem;
`;

// ─── Default code ─────────────────────────────────────────────────────────────
const DEFAULT_CODE = `<html>
<head>
<title>HTML Sample</title>
<meta http-equiv="X-UA-Compatible" content="IE=edge" />
<style type="text/css">
h1 {
  color: #cca3a3;
}
</style>
<script type="text/javascript">
  alert("I am a sample... visit devChallenges.io for more projects");
</script>
</head>
<body>
  <h1>Heading No.1</h1>
  <input disabled type="button" value="Click me" />
</body>
</html>`;

// ─── Protected editor page ─────────────────────────────────────────────────────
function EditorPage() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [code,     setCode]     = useState(DEFAULT_CODE);
    const [language, setLanguage] = useState('html');
    const [theme,    setTheme]    = useState('light');

    const handleCodeChange = (newCode) => {
        setCode(newCode);
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <AppContainer>
            <MainContent>
                <TopBar>
                    {user && <UserChip>Hola, {user.username}</UserChip>}
                    <LogoutButton onClick={handleLogout}>Cerrar sesión</LogoutButton>
                </TopBar>
                <Header />
                <CodeEditor
                    code={code}
                    language={language}
                    theme={theme}
                    onCodeChange={handleCodeChange}
                    onLanguageChange={setLanguage}
                    onThemeChange={setTheme}
                />
            </MainContent>
        </AppContainer>
    );
}

// ─── Route guard ──────────────────────────────────────────────────────────────
function RequireAuth({ children }) {
    const { user } = useAuth();
    if (!user) return <Navigate to="/login" replace />;
    return children;
}

// ─── Root ─────────────────────────────────────────────────────────────────────
function AppRoutes() {
    return (
        <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/share/:urlCode" element={<SharePage />} />
            <Route
                path="/"
                element={
                    <RequireAuth>
                        <EditorPage />
                    </RequireAuth>
                }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <AppRoutes />
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;