import { h } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import AdminPanel from './AdminPanel.tsx';

interface Props {
  initialData: any;
}

export default function AdminApp({ initialData }: Props) {
  const [token, setToken] = useState<string | null>(null);
  const [inputToken, setInputToken] = useState('');
  const [remember, setRemember] = useState(false);

  // Verificar si ya hay un token al montar el componente
  useEffect(() => {
    const storedToken = sessionStorage.getItem('github_token') || localStorage.getItem('github_token_remember');
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  const handleLogin = (e: Event) => {
    e.preventDefault();
    if (inputToken.trim()) {
      sessionStorage.setItem('github_token', inputToken.trim());
      if (remember) {
        localStorage.setItem('github_token_remember', inputToken.trim());
      }
      setToken(inputToken.trim());
    }
  };

  // Si no hay token, mostrar el formulario de login
  if (!token) {
    return (
      <div class="login-form">
        <h1>🔐 Acceso Admin</h1>
        <p style="font-size: 13px; color: #666; margin-bottom: 20px;">Ingresá tu token de GitHub (fine-grained, permiso Contents: read/write)</p>
        <form onSubmit={handleLogin}>
          <input
            type="password"
            value={inputToken}
            onInput={(e: any) => setInputToken(e.target.value)}
            placeholder="github_pat_xxxxxxxxxxxx"
            required
          />
          <label style="font-size: 12px; display: flex; align-items: center; gap: 5px; margin-bottom: 15px; cursor: pointer;">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e: any) => setRemember(e.target.checked)}
            /> Recordar en este dispositivo
          </label>
          <button type="submit">Ingresar</button>
        </form>
      </div>
    );
  }

  // Si hay token, mostrar el panel completo
  return <AdminPanel currentData={initialData} />;
}
