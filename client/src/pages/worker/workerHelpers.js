export const formatInr = (amount = 0) => {
  return `Rs ${new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(amount)}`;
};

export const formatDate = (value) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

export const isSameDay = (dateA, dateB = new Date()) => {
  const a = new Date(dateA);
  const b = new Date(dateB);
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
};

export const getStatusBadgeClass = (status) => {
  if (status === 'completed') return 'badge-success';
  if (status === 'active' || status === 'confirmed') return 'badge-primary';
  if (status === 'cancelled') return 'badge-danger';
  return 'badge-warning';
};
