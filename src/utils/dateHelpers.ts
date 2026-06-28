export const formatDate = (date: Date | { toDate: () => Date } | null): string => {
  if (!date) return '-';
  const d = typeof date === 'object' && 'toDate' in date ? date.toDate() : new Date(date);
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(d);
};

export const formatDateTime = (date: Date | { toDate: () => Date } | null): string => {
  if (!date) return '-';
  const d = typeof date === 'object' && 'toDate' in date ? date.toDate() : new Date(date);
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
};

export const formatRelativeTime = (date: Date | { toDate: () => Date } | null): string => {
  if (!date) return '-';
  const d = typeof date === 'object' && 'toDate' in date ? date.toDate() : new Date(date);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000);

  if (diffInSeconds < 60) return 'Baru saja';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} menit yang lalu`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} jam yang lalu`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} hari yang lalu`;
  return formatDate(d);
};

export const getCountdown = (targetDate: Date | { toDate: () => Date } | null): { hours: number; minutes: number; seconds: number } | null => {
  if (!targetDate) return null;
  const target = typeof targetDate === 'object' && 'toDate' in targetDate ? targetDate.toDate() : new Date(targetDate);
  const now = new Date();
  const diff = target.getTime() - now.getTime();

  if (diff <= 0) return { hours: 0, minutes: 0, seconds: 0 };

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  return { hours, minutes, seconds };
};
