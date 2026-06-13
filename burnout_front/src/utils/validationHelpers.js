/**
 * Utilități pentru validarea datelor.
 * Conține funcții primitive pentru verificarea integrității input-urilor.
 */
export const isRequired = (value) => {
  if (value === null || value === undefined) return false;
  return String(value).trim() !== "";
};

export const isValidEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const hasMinLength = (value, min) => value.length >= min;

export const containsOnlyLetters = (value) => {
  const re = /^[a-zA-ZăâîșțĂÂÎȘȚ\s-]+$/;
  return re.test(value);
};