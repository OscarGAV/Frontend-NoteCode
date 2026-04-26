import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import DownArrow from '../assets/down arrow.svg';
import ShareIcon from '../assets/Share.svg';
import LinkIcon from '../assets/link.svg';
import { createSnippet } from '../services/api';

// ─── Theme tokens ─────────────────────────────────────────────────────────────
const THEMES = {
  light: {
    editorBg: '#ffffff',
    headerBg: '#f9fafb',
    footerBg: '#f9fafb',
    border: '#e5e7eb',
    lineNumBg: '#f8fafc',
    lineNumColor: '#9ca3af',
    codeColor: '#1f2937',
    titleColor: '#6b7280',
  },
  dark: {
    editorBg: '#1e1e2e',
    headerBg: '#181825',
    footerBg: '#181825',
    border: '#313244',
    lineNumBg: '#181825',
    lineNumColor: '#585b70',
    codeColor: '#cdd6f4',
    titleColor: '#a6adc8',
  },
};

// ─── Styled components ────────────────────────────────────────────────────────
const EditorContainer = styled.div`
  background: ${p => p.theme.editorBg};
  border-radius: 12px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 900px;
  position: relative;
  z-index: 3;
  border: 1px solid ${p => p.theme.border};
  transition: background 0.25s, border-color 0.25s;

  @media (max-width: 768px) {
    margin: 0 1rem;
    max-width: calc(100% - 2rem);
  }
`;

const EditorHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid ${p => p.theme.border};
  background: ${p => p.theme.headerBg};
  border-radius: 12px 12px 0 0;
  transition: background 0.25s;
`;

const EditorTitle = styled.div`
  font-family: 'Outfit', sans-serif;
  font-size: 0.875rem;
  font-weight: 500;
  color: ${p => p.theme.titleColor};
`;

const EditorControls = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const ControlButton = styled.button`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  &:nth-child(1) { background: #ef4444; }
  &:nth-child(2) { background: #f59e0b; }
  &:nth-child(3) { background: #10b981; }
`;

const CodeArea = styled.div`
  position: relative;
  background: ${p => p.theme.editorBg};
  overflow: hidden;
  max-height: 420px;
  overflow-y: auto;
  transition: background 0.25s;

  &::-webkit-scrollbar { width: 6px; }
  &::-webkit-scrollbar-track { background: transparent; }
  &::-webkit-scrollbar-thumb { background: rgba(139,92,246,0.25); border-radius: 3px; }
`;

const LineNumbers = styled.div`
  position: absolute;
  left: 0;
  top: 0;
  background: ${p => p.theme.lineNumBg};
  padding: 1rem 0.75rem;
  font-family: 'Fira Code', 'Monaco', 'Consolas', monospace;
  font-size: 0.875rem;
  color: ${p => p.theme.lineNumColor};
  line-height: 1.5;
  user-select: none;
  z-index: 1;
  min-height: 100%;
  border-right: 1px solid ${p => p.theme.border};
  transition: background 0.25s, color 0.25s;
`;

const CODE_BASE_STYLES = `
  margin-left: 3rem;
  padding: 1rem 1.5rem;
  font-family: 'Fira Code', 'Monaco', 'Consolas', monospace;
  font-size: 0.875rem;
  line-height: 1.5;
  white-space: pre-wrap;
  word-wrap: break-word;
  min-height: 200px;
  transition: color 0.25s, background 0.25s;
`;

const CodeDisplay = styled.div`
  ${CODE_BASE_STYLES}
  color: ${p => p.theme.codeColor};
  cursor: text;
  outline: none;
`;

const CodeEditable = styled.div`
  ${CODE_BASE_STYLES}
  color: ${p => p.theme.codeColor};
  outline: none;
  border: none;
  background: transparent;
`;

const EditorFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  background: ${p => p.theme.footerBg};
  border-top: 1px solid ${p => p.theme.border};
  border-radius: 0 0 12px 12px;
  transition: background 0.25s;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
`;

const FooterLeft = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
`;

const Dropdown = styled.div`
  position: relative;
  display: inline-block;
`;

const DropdownButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: ${p => p.theme.editorBg};
  border: 1px solid ${p => p.theme.border};
  border-radius: 6px;
  font-family: 'Outfit', sans-serif;
  font-size: 0.875rem;
  font-weight: 500;
  color: ${p => p.theme.codeColor};
  cursor: pointer;
  transition: all 0.2s;

  &:hover { border-color: #9ca3af; }
  &:focus {
    outline: none;
    border-color: #8b5cf6;
    box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
  }
`;

const DropdownIcon = styled.img`
  width: 12px;
  height: 12px;
  opacity: 0.6;
  ${p => p.darkMode && 'filter: invert(1);'}
`;

const DropdownMenu = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: ${p => p.theme.editorBg};
  border: 1px solid ${p => p.theme.border};
  border-radius: 6px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.15);
  z-index: 10;
  display: ${p => p.isOpen ? 'block' : 'none'};
`;

const DropdownItem = styled.button`
  width: 100%;
  padding: 0.5rem 0.75rem;
  background: none;
  border: none;
  text-align: left;
  font-family: 'Outfit', sans-serif;
  font-size: 0.875rem;
  color: ${p => p.theme.codeColor};
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover { background: ${p => p.theme.lineNumBg}; }
  &:first-child { border-radius: 6px 6px 0 0; }
  &:last-child  { border-radius: 0 0 6px 6px; }
`;

const FooterRight = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;

  @media (max-width: 768px) { justify-content: space-between; }
`;

const ShareLink = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-family: 'Outfit', sans-serif;
  font-size: 0.875rem;
  color: #8b5cf6;
  font-weight: 500;
  cursor: pointer;

  &:hover { text-decoration: underline; }
`;

const LinkIconImg = styled.img`
  width: 16px;
  height: 16px;
  opacity: 0.7;
`;

const ShareButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: ${p => (p.disabled ? '#9ca3af' : p.$loading ? '#a78bfa' : '#8b5cf6')};
  color: #ffffff;
  border: none;
  border-radius: 6px;
  font-family: 'Outfit', sans-serif;
  font-size: 1rem;
  font-weight: 600;
  cursor: ${p => (p.disabled ? 'not-allowed' : 'pointer')};
  transition: all 0.2s;

  &:hover:not(:disabled) {
    background: #7c3aed;
    transform: translateY(-1px);
  }
  &:active:not(:disabled) { transform: translateY(0); }
`;

const ShareIconImg = styled.img`
  width: 16px;
  height: 16px;
`;

const ErrorBanner = styled.div`
  background: #fef2f2;
  border-top: 1px solid #fecaca;
  padding: 0.6rem 1.5rem;
  font-family: 'Outfit', sans-serif;
  font-size: 0.82rem;
  color: #dc2626;
`;

const CopiedBadge = styled.span`
  font-family: 'Outfit', sans-serif;
  font-size: 0.75rem;
  color: #10b981;
  font-weight: 500;
`;

// ─── Language options ─────────────────────────────────────────────────────────
const LANGUAGES = [
  { value: 'html',       label: 'HTML' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'css',        label: 'CSS' },
  { value: 'python',     label: 'Python' },
  { value: 'java',       label: 'Java' },
];

const THEME_OPTIONS = [
  { value: 'light', label: 'Light' },
  { value: 'dark',  label: 'Dark' },
];

// ─── Component ────────────────────────────────────────────────────────────────
function CodeEditor({ code, language, theme, onCodeChange, onLanguageChange, onThemeChange }) {
  const [isLangOpen,  setIsLangOpen]  = useState(false);
  const [isThemeOpen, setIsThemeOpen] = useState(false);
  const [isEditing,   setIsEditing]   = useState(false);
  const [shareUrl,    setShareUrl]    = useState(null);
  const [shareLoading, setShareLoading] = useState(false);
  const [shareError,   setShareError]   = useState('');
  const [copied,       setCopied]       = useState(false);

  const codeRef = useRef(null);
  const t = THEMES[theme] || THEMES.light;
  const darkMode = theme === 'dark';

  useEffect(() => {
    if (isEditing && codeRef.current) {
      codeRef.current.focus();
    }
  }, [isEditing]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handler = () => { setIsLangOpen(false); setIsThemeOpen(false); };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, []);

  const handleCodeInput = (e) => {
    onCodeChange(e.currentTarget.innerText || '');
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const text = (e.clipboardData || window.clipboardData).getData('text');
    document.execCommand('insertText', false, text);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      document.execCommand('insertText', false, '  ');
    }
  };

  const handleShare = async () => {
    if (!code.trim()) {
      setShareError('El editor está vacío. Escribe algún código antes de compartir.');
      return;
    }
    setShareError('');
    setShareLoading(true);
    try {
      const data = await createSnippet(code, language);
      const urlCode = data.shareUrl || data.snippetId;
      const url = `${window.location.origin}/share/${urlCode}`;
      setShareUrl(url);
    } catch (err) {
      setShareError('Error al compartir. Verifica que el backend esté corriendo en localhost:8080.');
    } finally {
      setShareLoading(false);
    }
  };

  const handleCopyLink = () => {
    if (!shareUrl) return;
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const lineCount = (code || '').split('\n').length;

  return (
      <EditorContainer theme={t}>
        <EditorHeader theme={t}>
          <EditorTitle theme={t}>Code Editor</EditorTitle>
          <EditorControls>
            <ControlButton />
            <ControlButton />
            <ControlButton />
          </EditorControls>
        </EditorHeader>

        <CodeArea theme={t}>
          <LineNumbers theme={t}>
            {Array.from({ length: Math.max(lineCount, 1) }, (_, i) => (
                <div key={i}>{i + 1}</div>
            ))}
          </LineNumbers>

          {isEditing ? (
              <CodeEditable
                  ref={codeRef}
                  theme={t}
                  contentEditable
                  suppressContentEditableWarning
                  onInput={handleCodeInput}
                  onKeyDown={handleKeyDown}
                  onBlur={() => setIsEditing(false)}
                  onPaste={handlePaste}
              >
                {code || ''}
              </CodeEditable>
          ) : (
              <CodeDisplay theme={t} onClick={() => setIsEditing(true)}>
                {code || ''}
              </CodeDisplay>
          )}
        </CodeArea>

        {shareError && <ErrorBanner>{shareError}</ErrorBanner>}

        <EditorFooter theme={t}>
          <FooterLeft>
            {/* Language dropdown */}
            <Dropdown onClick={e => e.stopPropagation()}>
              <DropdownButton theme={t} onClick={() => setIsLangOpen(o => !o)}>
                {LANGUAGES.find(l => l.value === language)?.label || 'HTML'}
                <DropdownIcon src={DownArrow} alt="dropdown" darkMode={darkMode} />
              </DropdownButton>
              <DropdownMenu theme={t} isOpen={isLangOpen}>
                {LANGUAGES.map(lang => (
                    <DropdownItem
                        key={lang.value}
                        theme={t}
                        onClick={() => { onLanguageChange(lang.value); setIsLangOpen(false); setShareUrl(null); }}
                    >
                      {lang.label}
                    </DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>

            {/* Theme dropdown */}
            <Dropdown onClick={e => e.stopPropagation()}>
              <DropdownButton theme={t} onClick={() => setIsThemeOpen(o => !o)}>
                {THEME_OPTIONS.find(o => o.value === theme)?.label || 'Light'}
                <DropdownIcon src={DownArrow} alt="dropdown" darkMode={darkMode} />
              </DropdownButton>
              <DropdownMenu theme={t} isOpen={isThemeOpen}>
                {THEME_OPTIONS.map(opt => (
                    <DropdownItem
                        key={opt.value}
                        theme={t}
                        onClick={() => { onThemeChange(opt.value); setIsThemeOpen(false); }}
                    >
                      {opt.label}
                    </DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>
          </FooterLeft>

          <FooterRight>
            {shareUrl && (
                <>
                  <ShareLink onClick={handleCopyLink}>
                    <LinkIconImg src={LinkIcon} alt="link" />
                    {shareUrl.replace(window.location.origin, '...')}
                  </ShareLink>
                  {copied && <CopiedBadge>Copiado!</CopiedBadge>}
                </>
            )}

            <ShareButton
                onClick={handleShare}
                disabled={!!shareUrl}
                $$loading={shareLoading}
            >
              <ShareIconImg src={ShareIcon} alt="share" />
              {shareLoading ? 'Guardando...' : shareUrl ? 'Compartido' : 'Share'}
            </ShareButton>
          </FooterRight>
        </EditorFooter>
      </EditorContainer>
  );
}

export default CodeEditor;