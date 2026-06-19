// Separate file for useAuth hook — required for Vite Fast Refresh compatibility
// (Vite HMR requires a file to export ONLY components OR ONLY hooks, not both)
export { useAuth } from './AuthContext';
