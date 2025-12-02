export const getToastBackgroundColor = (type: 'success' | 'error' | 'info'): string => {
  switch (type) {
    case 'success':
      return '#10B981';
    case 'error':
      return '#EF4444';
    case 'info':
      return '#3B82F6';
    default:
      return '#6B7280';
  }
};

export const getToastIcon = (type: 'success' | 'error' | 'info'): string => {
  switch (type) {
    case 'success':
      return '✓';
    case 'error':
      return '✕';
    case 'info':
      return 'ℹ';
    default:
      return '';
  }
};
