const BACKEND_URL = 'http://localhost:8088';

export const getImageUrl = (path) => {
  if (!path) return 'https://placehold.co/400x400?text=No+Image';
  if (path.startsWith('http') || path.startsWith('data:')) return path;
  // For local files, the backend serves them at /api/uploads/files/
  return `${BACKEND_URL}/api/uploads/files/${path}`;
};
