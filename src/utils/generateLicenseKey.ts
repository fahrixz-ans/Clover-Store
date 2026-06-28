export const generateLicenseKey = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const segments = 4;
  const segmentLength = 4;
  
  let key = '';
  for (let s = 0; s < segments; s++) {
    for (let i = 0; i < segmentLength; i++) {
      key += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    if (s < segments - 1) key += '-';
  }
  return key;
};
