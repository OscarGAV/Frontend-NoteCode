import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { AuthProvider, useAuth } from './services/AuthContext';
import CodeEditor from './components/CodeEditor';
import Header from './components/Header';
import LoginPage from './pages/LoginPage';
import SharePage from './pages/SharePage';
import NoteCodeLogo from './assets/NoteCodeLogo.svg';
import HeroBackground from './assets/Hero-Background-notecode.svg';
import { getSnippetsByUser } from './services/api';

// ─── Animations ──────────────────────────────────────────────────────────────
const slideIn = keyframes`
  from { transform: translateX(-100%); opacity: 0; }
  to   { transform: translateX(0);     opacity: 1; }
`;

const fadeOverlay = keyframes`
  from { opacity: 0; }
  to   { opacity: 1; }
`;

// ─── Layout ───────────────────────────────────────────────────────────────────
const AppContainer = styled.div`
  height: 100vh;
  display: flex;
  flex-direction: column;
  background:
    url(${HeroBackground}) no-repeat bottom center,
    linear-gradient(180deg, #ffffff 0%, #ffffff 65%, #8B5CF6 100%);
  background-size: cover;
  overflow: hidden;
`;

// ─── Navbar ───────────────────────────────────────────────────────────────────
const Navbar = styled.nav`
  height: 56px;
  min-height: 56px;
  background: rgba(255,255,255,0.92);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(0,0,0,0.06);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 1.5rem;
  position: relative;
  z-index: 100;
`;

const NavLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const HamburgerButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 6px;
  border-radius: 6px;
  transition: background 0.2s;

  &:hover { background: rgba(139, 92, 246, 0.08); }

  span {
    display: block;
    width: 20px;
    height: 2px;
    background: #7c3aed;
    border-radius: 2px;
    transition: all 0.25s;
  }

  &.open span:nth-child(1) { transform: translateY(6px) rotate(45deg); }
  &.open span:nth-child(2) { opacity: 0; transform: scaleX(0); }
  &.open span:nth-child(3) { transform: translateY(-6px) rotate(-45deg); }
`;

const NavLogo = styled.img`
  height: 28px;
  width: auto;
`;

const NavRight = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const UserChip = styled.span`
  font-family: 'Outfit', sans-serif;
  font-size: 0.82rem;
  color: #6b7280;
`;

const LogoutButton = styled.button`
  background: none;
  border: 1.5px solid rgba(139, 92, 246, 0.35);
  border-radius: 6px;
  padding: 0.35rem 0.85rem;
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

// ─── Body (sidebar + content) ─────────────────────────────────────────────────
const Body = styled.div`
  flex: 1;
  display: flex;
  overflow: hidden;
  position: relative;
`;

// ─── Sidebar ──────────────────────────────────────────────────────────────────
const Overlay = styled.div`
  display: ${p => p.open ? 'block' : 'none'};
  position: fixed;
  inset: 56px 0 0 0;
  background: rgba(0,0,0,0.25);
  z-index: 49;
  animation: ${fadeOverlay} 0.2s ease;
`;

const Sidebar = styled.aside`
  position: fixed;
  top: 56px;
  left: 0;
  bottom: 0;
  width: 300px;
  background: #ffffff;
  border-right: 1px solid #e5e7eb;
  z-index: 50;
  display: flex;
  flex-direction: column;
  animation: ${slideIn} 0.25s ease;
  box-shadow: 4px 0 24px rgba(0,0,0,0.08);
`;

const SidebarHeader = styled.div`
  padding: 1.25rem 1.25rem 0.75rem;
  border-bottom: 1px solid #f3f4f6;
`;

const SidebarTitle = styled.h3`
  font-family: 'Outfit', sans-serif;
  font-size: 0.95rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 0.25rem;
`;

const SidebarSubtitle = styled.p`
  font-family: 'Outfit', sans-serif;
  font-size: 0.75rem;
  color: #9ca3af;
  margin: 0;
`;

const SnippetList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 0.75rem 0;

  &::-webkit-scrollbar { width: 4px; }
  &::-webkit-scrollbar-track { background: transparent; }
  &::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 2px; }
`;

const SnippetItem = styled.div`
  padding: 0.75rem 1.25rem;
  cursor: pointer;
  transition: background 0.15s;
  border-bottom: 1px solid #f9fafb;

  &:hover { background: #f5f3ff; }
`;

const SnippetDate = styled.div`
  font-family: 'Outfit', sans-serif;
  font-size: 0.78rem;
  font-weight: 500;
  color: #6b7280;
  margin-bottom: 0.25rem;
`;

const SnippetPreview = styled.p`
  font-family: 'Fira Code', monospace;
  font-size: 0.72rem;
  color: #6b7280;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const SnippetShareUrl = styled.div`
  display: flex;
  align-items: center;
  gap: 0.35rem;
  margin-top: 0.3rem;
`;

const SnippetLink = styled.a`
  font-family: 'Outfit', sans-serif;
  font-size: 0.7rem;
  color: #8b5cf6;
  text-decoration: none;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  &:hover { text-decoration: underline; }
`;

const CopyBtn = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  font-family: 'Outfit', sans-serif;
  font-size: 0.65rem;
  color: #9ca3af;
  padding: 0;
  flex-shrink: 0;

  &:hover { color: #7c3aed; }
`;

const EmptyState = styled.div`
  padding: 2rem 1.25rem;
  text-align: center;
  font-family: 'Outfit', sans-serif;
  font-size: 0.85rem;
  color: #9ca3af;
`;

const LoadingState = styled(EmptyState)``;

// ─── Main scroll area ─────────────────────────────────────────────────────────
const MainScroll = styled.div`
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem 1rem 3rem;
  position: relative;
  z-index: 2;

  &::-webkit-scrollbar { width: 6px; }
  &::-webkit-scrollbar-track { background: transparent; }
  &::-webkit-scrollbar-thumb { background: rgba(139,92,246,0.3); border-radius: 3px; }
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

// ─── Sidebar component ────────────────────────────────────────────────────────
function SnippetsSidebar({ open, onClose, userId }) {
    const [snippets, setSnippets]     = useState([]);
    const [loading,  setLoading]      = useState(false);
    const [copied,   setCopied]       = useState(null);

    const load = useCallback(() => {
        if (!userId) return;
        setLoading(true);
        getSnippetsByUser(userId)
            .then(data => setSnippets(Array.isArray(data) ? data : []))
            .catch(() => setSnippets([]))
            .finally(() => setLoading(false));
    }, [userId]);

    useEffect(() => {
        if (open) load();
    }, [open, load]);

    const handleCopy = (url, id) => {
        navigator.clipboard.writeText(url).then(() => {
            setCopied(id);
            setTimeout(() => setCopied(null), 2000);
        });
    };

    const formatDate = (val) => {
        if (!val) return '';
        // Java Date serializes as epoch ms (number) or ISO string
        const d = new Date(val);
        if (isNaN(d.getTime())) return '';
        const day   = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year  = d.getFullYear();
        const hours = d.getHours();
        const h12   = hours % 12 || 12;
        const ampm  = hours < 12 ? 'am' : 'pm';
        return `${day}-${month}-${year}, ${h12} ${ampm}`;
    };

    return (
        <>
            <Overlay open={open} onClick={onClose} />
            {open && (
                <Sidebar>
                    <SidebarHeader>
                        <SidebarTitle>Mis snippets compartidos</SidebarTitle>
                        <SidebarSubtitle>Haz clic en el enlace para copiarlo</SidebarSubtitle>
                    </SidebarHeader>

                    <SnippetList>
                        {loading && <LoadingState>Cargando snippets...</LoadingState>}

                        {!loading && snippets.length === 0 && (
                            <EmptyState>Aún no has compartido ningún snippet.</EmptyState>
                        )}

                        {!loading && snippets.map(s => {
                            const shareUrl = `${window.location.origin}/share/${s.shareUrl || s.snippetId}`;
                            return (
                                <SnippetItem key={s.snippetId}>
                                    <SnippetDate>{formatDate(s.createdAt)}</SnippetDate>
                                    <SnippetPreview>{(s.content || '').split('\n')[0]}</SnippetPreview>
                                    <SnippetShareUrl>
                                        <SnippetLink href={shareUrl} target="_blank" rel="noreferrer">
                                            /share/{s.shareUrl || s.snippetId}
                                        </SnippetLink>
                                        <CopyBtn onClick={() => handleCopy(shareUrl, s.snippetId)}>
                                            {copied === s.snippetId ? 'Copiado' : 'Copiar'}
                                        </CopyBtn>
                                    </SnippetShareUrl>
                                </SnippetItem>
                            );
                        })}
                    </SnippetList>
                </Sidebar>
            )}
        </>
    );
}

// ─── Editor page ──────────────────────────────────────────────────────────────
function EditorPage() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [code,    setCode]    = useState(DEFAULT_CODE);
    const [theme,   setTheme]   = useState('light');
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const handleLogout = () => { logout(); navigate('/login'); };

    return (
        <AppContainer>
            <Navbar>
                <NavLeft>
                    <HamburgerButton
                        className={sidebarOpen ? 'open' : ''}
                        onClick={() => setSidebarOpen(o => !o)}
                        aria-label="Toggle menu"
                    >
                        <span /><span /><span />
                    </HamburgerButton>
                    <NavLogo src={NoteCodeLogo} alt="NoteCode" />
                </NavLeft>
                <NavRight>
                    {user && <UserChip>Hola, {user.username}</UserChip>}
                    <LogoutButton onClick={handleLogout}>Cerrar sesión</LogoutButton>
                </NavRight>
            </Navbar>

            <Body>
                <SnippetsSidebar
                    open={sidebarOpen}
                    onClose={() => setSidebarOpen(false)}
                    userId={user?.id}
                />

                <MainScroll>
                    <Header />
                    <CodeEditor
                        code={code}
                        theme={theme}
                        onCodeChange={setCode}
                        onThemeChange={setTheme}
                    />
                </MainScroll>
            </Body>
        </AppContainer>
    );
}

// ─── Route guard ──────────────────────────────────────────────────────────────
function RequireAuth({ children }) {
    const { user } = useAuth();
    if (!user) return <Navigate to="/login" replace />;
    return children;
}

function AppRoutes() {
    return (
        <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/share/:urlCode" element={<SharePage />} />
            <Route path="/" element={<RequireAuth><EditorPage /></RequireAuth>} />
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