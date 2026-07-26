import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '@/store/hooks';
import { setCredentials } from './authSlice';
import { authApi } from '@/api/auth.api';
import styles from './LoginPage.module.scss';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const { token, user } = await authApi.login({ email, password });
      
      dispatch(setCredentials({ token, user }));
      
      navigate('/dashboard');
    } catch (err: any) {
      const message = err?.response?.data?.message || 'Login failed. Please try again.';
      setError(message);
    } finally {
 setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.loginCard}>
        <div className={styles.header}>
          <h1>Job Processing Monitor</h1>
          <p>Sign in to continue</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {error && (
            <div className={styles.errorBanner}>
              {error}
            </div>
          )}

          <div className={styles.formGroup}>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@test.com"
              required
              disabled={isLoading}
              autoFocus
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              disabled={isLoading}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={styles.btnLogin}
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className={styles.testAccounts}>
          <p className={styles.testTitle}>Test Accounts:</p>
          <div className={styles.testGrid}>
            <div className={styles.testAccount}>
              <strong>Admin</strong>
              <code>admin@test.com</code>
            </div>
            <div className={styles.testAccount}>
              <strong>Operator</strong>
              <code>operator@test.com</code>
            </div>
            <div className={styles.testAccount}>
              <strong>Viewer</strong>
              <code>viewer@test.com</code>
            </div>
          </div>
          <p className={styles.testPassword}>Password: <code>password123</code></p>
        </div>
      </div>
    </div>
  );
};