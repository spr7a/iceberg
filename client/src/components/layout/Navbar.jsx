import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="border-b border-bg-tertiary bg-bg-secondary">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <span className="text-lg font-bold tracking-tight text-text-primary">
            Dig deeper. Find everything.
          </span>

          <div className="flex items-center gap-6">
            {user && (
              <Link to="/library" className="text-sm text-text-secondary hover:text-text-primary transition-colors">
                Library
              </Link>
            )}
            {user ? (
              <div className="flex items-center gap-4">
                <span className="text-sm text-text-tertiary">{user.name || user.email}</span>
                <button
                  onClick={logout}
                  className="border border-bg-tertiary text-text-secondary hover:text-text-primary hover:border-text-tertiary px-4 py-1.5 rounded-sm text-sm transition-all duration-150"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="text-sm text-text-secondary hover:text-text-primary px-4 py-1.5 rounded-sm transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-accent hover:bg-accent-hover text-white px-4 py-1.5 rounded-sm text-sm transition-all duration-150 active:scale-[0.98]"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;