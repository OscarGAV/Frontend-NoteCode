import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../services/AuthContext';
import NoteCodeLogo from '../assets/NoteCodeLogo.svg';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const PageWrapper = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f5f3ff 0%, #ede9fe 40%, #ddd6fe 100%);
  padding: 2rem 1rem;
`;

const Card = styled.div`
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 24px 60px rgba(109, 40, 217, 0.15);
  width: 100%;
  max-width: 420px;
  padding: 2.5rem 2rem;
  animation: ${fadeIn} 0.4s ease both;
`;

const LogoRow = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 1.75rem;
`;

const LogoImg = styled.img`
  height: 48px;
  width: auto;
`;

const TabRow = styled.div`
  display: flex;
  border-bottom: 2px solid #e5e7eb;
  margin-bottom: 1.75rem;
`;

const Tab = styled.button`
  flex: 1;
  padding: 0.6rem 0;
  background: none;
  border: none;
  border-bottom: 2px solid ${props => props.active ? '#8b5cf6' : 'transparent'};
  margin-bottom: -2px;
  font-family: 'Outfit', sans-serif;
  font-size: 0.95rem;
  font-weight: ${props => props.active ? '600' : '400'};
  color: ${props => props.active ? '#8b5cf6' : '#6b7280'};
  cursor: pointer;
  transition: all 0.2s;
`;

const Field = styled.div`
  margin-bottom: 1.1rem;
`;

const Label = styled.label`
  display: block;
  font-family: 'Outfit', sans-serif;
  font-size: 0.8rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.4rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.65rem 0.9rem;
  border: 1.5px solid ${props => props.hasError ? '#ef4444' : '#d1d5db'};
  border-radius: 8px;
  font-family: 'Outfit', sans-serif;
  font-size: 0.9rem;
  color: #1f2937;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
  background: #fafafa;

  &:focus {
    border-color: #8b5cf6;
    box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.12);
    background: #fff;
  }

  &::placeholder {
    color: #9ca3af;
  }
`;

const ErrorMsg = styled.p`
  font-family: 'Outfit', sans-serif;
  font-size: 0.78rem;
  color: #ef4444;
  margin-top: 0.35rem;
`;

const GlobalError = styled.div`
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  padding: 0.65rem 0.85rem;
  font-family: 'Outfit', sans-serif;
  font-size: 0.85rem;
  color: #dc2626;
  margin-bottom: 1.1rem;
`;

const SubmitButton = styled.button`
  width: 100%;
  padding: 0.8rem;
  background: ${props => props.loading ? '#a78bfa' : '#8b5cf6'};
  color: #fff;
  border: none;
  border-radius: 8px;
  font-family: 'Outfit', sans-serif;
  font-size: 1rem;
  font-weight: 600;
  cursor: ${props => props.loading ? 'not-allowed' : 'pointer'};
  transition: background 0.2s, transform 0.1s;
  margin-top: 0.5rem;

  &:hover:not(:disabled) {
    background: #7c3aed;
    transform: translateY(-1px);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }
`;

const Divider = styled.p`
  text-align: center;
  font-family: 'Outfit', sans-serif;
  font-size: 0.82rem;
  color: #9ca3af;
  margin-top: 1.25rem;

  button {
    background: none;
    border: none;
    color: #8b5cf6;
    font-family: inherit;
    font-size: inherit;
    font-weight: 600;
    cursor: pointer;
    padding: 0;

    &:hover { text-decoration: underline; }
  }
`;

function LoginPage() {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('signin');
  const [loading, setLoading] = useState(false);
  const [globalError, setGlobalError] = useState('');

  const [signinForm, setSigninForm] = useState({ username: '', password: '' });
  const [signupForm, setSignupForm] = useState({ username: '', email: '', password: '', confirm: '' });
  const [signupErrors, setSignupErrors] = useState({});

  const handleSignIn = async (e) => {
    e.preventDefault();
    setGlobalError('');
    setLoading(true);
    try {
      await login(signinForm.username, signinForm.password);
      navigate('/');
    } catch (err) {
      setGlobalError('Usuario o contraseña incorrectos');
    } finally {
      setLoading(false);
    }
  };

  const validateSignup = () => {
    const errors = {};
    if (!signupForm.username.trim()) errors.username = 'El usuario es requerido';
    if (!signupForm.email.trim()) errors.email = 'El correo es requerido';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(signupForm.email)) errors.email = 'Correo inválido';
    if (signupForm.password.length < 6) errors.password = 'Mínimo 6 caracteres';
    if (signupForm.password !== signupForm.confirm) errors.confirm = 'Las contraseñas no coinciden';
    return errors;
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setGlobalError('');
    const errors = validateSignup();
    if (Object.keys(errors).length > 0) {
      setSignupErrors(errors);
      return;
    }
    setSignupErrors({});
    setLoading(true);
    try {
      await register(signupForm.username, signupForm.password, signupForm.email);
      navigate('/');
    } catch (err) {
      setGlobalError('No se pudo crear la cuenta. El usuario o correo ya existe.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageWrapper>
      <Card>
        <LogoRow>
          <LogoImg src={NoteCodeLogo} alt="NoteCode" />
        </LogoRow>

        <TabRow>
          <Tab active={tab === 'signin'} onClick={() => { setTab('signin'); setGlobalError(''); }}>
            Iniciar sesión
          </Tab>
          <Tab active={tab === 'signup'} onClick={() => { setTab('signup'); setGlobalError(''); }}>
            Registrarse
          </Tab>
        </TabRow>

        {globalError && <GlobalError>{globalError}</GlobalError>}

        {tab === 'signin' ? (
          <form onSubmit={handleSignIn}>
            <Field>
              <Label>Usuario</Label>
              <Input
                type="text"
                placeholder="tu_usuario"
                value={signinForm.username}
                onChange={e => setSigninForm(f => ({ ...f, username: e.target.value }))}
                required
              />
            </Field>
            <Field>
              <Label>Contraseña</Label>
              <Input
                type="password"
                placeholder="••••••••"
                value={signinForm.password}
                onChange={e => setSigninForm(f => ({ ...f, password: e.target.value }))}
                required
              />
            </Field>
            <SubmitButton type="submit" loading={loading} disabled={loading}>
              {loading ? 'Ingresando...' : 'Ingresar'}
            </SubmitButton>
          </form>
        ) : (
          <form onSubmit={handleSignUp}>
            <Field>
              <Label>Usuario</Label>
              <Input
                type="text"
                placeholder="tu_usuario"
                hasError={!!signupErrors.username}
                value={signupForm.username}
                onChange={e => setSignupForm(f => ({ ...f, username: e.target.value }))}
              />
              {signupErrors.username && <ErrorMsg>{signupErrors.username}</ErrorMsg>}
            </Field>
            <Field>
              <Label>Correo electrónico</Label>
              <Input
                type="email"
                placeholder="tu@correo.com"
                hasError={!!signupErrors.email}
                value={signupForm.email}
                onChange={e => setSignupForm(f => ({ ...f, email: e.target.value }))}
              />
              {signupErrors.email && <ErrorMsg>{signupErrors.email}</ErrorMsg>}
            </Field>
            <Field>
              <Label>Contraseña</Label>
              <Input
                type="password"
                placeholder="••••••••"
                hasError={!!signupErrors.password}
                value={signupForm.password}
                onChange={e => setSignupForm(f => ({ ...f, password: e.target.value }))}
              />
              {signupErrors.password && <ErrorMsg>{signupErrors.password}</ErrorMsg>}
            </Field>
            <Field>
              <Label>Confirmar contraseña</Label>
              <Input
                type="password"
                placeholder="••••••••"
                hasError={!!signupErrors.confirm}
                value={signupForm.confirm}
                onChange={e => setSignupForm(f => ({ ...f, confirm: e.target.value }))}
              />
              {signupErrors.confirm && <ErrorMsg>{signupErrors.confirm}</ErrorMsg>}
            </Field>
            <SubmitButton type="submit" loading={loading} disabled={loading}>
              {loading ? 'Creando cuenta...' : 'Crear cuenta'}
            </SubmitButton>
          </form>
        )}

        <Divider>
          {tab === 'signin'
            ? <>¿No tienes cuenta? <button onClick={() => setTab('signup')}>Regístrate</button></>
            : <>¿Ya tienes cuenta? <button onClick={() => setTab('signin')}>Inicia sesión</button></>
          }
        </Divider>
      </Card>
    </PageWrapper>
  );
}

export default LoginPage;
