import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useParams, useNavigate } from 'react-router-dom';
import { getSnippetByShareUrl } from '../services/api';
import NoteCodeLogo from '../assets/NoteCodeLogo.svg';

const PageWrapper = styled.div`
  min-height: 100vh;
  background: linear-gradient(180deg, #ffffff 0%, #ffffff 65%, #8B5CF6 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem 1rem;
`;

const TopBar = styled.div`
  width: 100%;
  max-width: 900px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const LogoImg = styled.img`
  height: 36px;
  width: auto;
`;

const HomeButton = styled.button`
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

const Card = styled.div`
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 900px;
  border: 1px solid rgba(0, 0, 0, 0.05);
  overflow: hidden;
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
`;

const CardTitle = styled.div`
  font-family: 'Outfit', sans-serif;
  font-size: 0.875rem;
  font-weight: 500;
  color: #6b7280;
`;

const LangBadge = styled.span`
  background: #ede9fe;
  color: #7c3aed;
  font-family: 'Outfit', sans-serif;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.25rem 0.6rem;
  border-radius: 999px;
  text-transform: uppercase;
`;

const EditorControls = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const ControlDot = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  &:nth-child(1) { background: #ef4444; }
  &:nth-child(2) { background: #f59e0b; }
  &:nth-child(3) { background: #10b981; }
`;

const CodeArea = styled.div`
  display: flex;
  background: #ffffff;
  min-height: 300px;
`;

const LineNumbers = styled.div`
  background: #f8fafc;
  padding: 1rem 0.75rem;
  font-family: 'Fira Code', 'Monaco', 'Consolas', monospace;
  font-size: 0.875rem;
  color: #9ca3af;
  line-height: 1.5;
  user-select: none;
  border-right: 1px solid #e5e7eb;
  min-width: 3rem;
  text-align: right;
`;

const CodeContent = styled.pre`
  flex: 1;
  margin: 0;
  padding: 1rem 1.5rem;
  font-family: 'Fira Code', 'Monaco', 'Consolas', monospace;
  font-size: 0.875rem;
  line-height: 1.5;
  color: #1f2937;
  white-space: pre-wrap;
  word-wrap: break-word;
  overflow: auto;
`;

const StatusMessage = styled.div`
  padding: 3rem;
  text-align: center;
  font-family: 'Outfit', sans-serif;
  font-size: 1rem;
  color: #6b7280;
`;

const ErrorMessage = styled(StatusMessage)`
  color: #dc2626;
`;

function SharePage() {
  const { urlCode } = useParams();
  const navigate = useNavigate();
  const [snippet, setSnippet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!urlCode) return;
    getSnippetByShareUrl(urlCode)
      .then(data => setSnippet(data))
      .catch(() => setError('No se encontró el snippet o el enlace expiró.'))
      .finally(() => setLoading(false));
  }, [urlCode]);

  const lines = snippet ? snippet.content.split('\n') : [];

  return (
    <PageWrapper>
      <TopBar>
        <LogoImg src={NoteCodeLogo} alt="NoteCode" />
        <HomeButton onClick={() => navigate('/')}>Ir al editor</HomeButton>
      </TopBar>

      <Card>
        <CardHeader>
          <EditorControls>
            <ControlDot />
            <ControlDot />
            <ControlDot />
          </EditorControls>
          <CardTitle>Snippet compartido</CardTitle>
          {snippet && <LangBadge>{snippet.language}</LangBadge>}
        </CardHeader>

        {loading && <StatusMessage>Cargando snippet...</StatusMessage>}
        {error   && <ErrorMessage>{error}</ErrorMessage>}

        {snippet && (
          <CodeArea>
            <LineNumbers>
              {lines.map((_, i) => (
                <div key={i}>{i + 1}</div>
              ))}
            </LineNumbers>
            <CodeContent>{snippet.content}</CodeContent>
          </CodeArea>
        )}
      </Card>
    </PageWrapper>
  );
}

export default SharePage;
