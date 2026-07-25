import { Outlet, useNavigate } from 'react-router-dom';
import { useAppDispatch } from '@/store/hooks';
import { useAuth } from '@/hooks/useAuth';
import { logout } from '@/features/auth/authSlice';
import styles from './Layout.module.scss';

export const Layout = () => {
  const { user } = useAuth();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <div className={styles.layout}>
      <nav className={styles.navbar}>
        <div className={styles.navContent}>
          <div className={styles.navBrand}>
            <h2>Job Monitor</h2>
          </div>

          <div className={styles.navActions}>
            <span className={styles.userInfo}>
              {user?.email} <span className={styles.role}>({user?.role})</span>
            </span>
            <button onClick={handleLogout} className={styles.btnLogout}>
              Logout
            </button>
          </div>
        </div>
      </nav>

      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
};