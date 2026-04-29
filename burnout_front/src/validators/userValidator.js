import { isRequired, isValidEmail, hasMinLength, containsOnlyLetters } from '../utils/validationHelpers';

export const validateRegisterForm = (data) => {
  const errors = {};

  if (!isRequired(data.first_name)) {
    errors.first_name = "Prenumele este obligatoriu.";
  } else if (!containsOnlyLetters(data.first_name)) {
    errors.first_name = "Prenumele poate conține doar litere.";
  }

  if (!isRequired(data.last_name)) {
    errors.last_name = "Numele este obligatoriu.";
  } else if (!containsOnlyLetters(data.last_name)) {
    errors.last_name = "Numele poate conține doar litere.";
  }

  if (!isRequired(data.username)) {
    errors.username = "Numele de utilizator este obligatoriu.";
  } else if (!hasMinLength(data.username, 3)) {
    errors.username = "Utilizatorul trebuie să aibă minim 3 caractere.";
  }

  if (!isRequired(data.email)) {
    errors.email = "Adresa de email este obligatorie.";
  } else if (!isValidEmail(data.email)) {
    errors.email = "Introduceți o adresă de email validă.";
  }

  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  if (!formData.password) {
      errors.password = "Parola este obligatorie.";
  } else if (!passwordRegex.test(formData.password)) {
      errors.password = "Parola trebuie să aibă min. 8 caractere, o literă mare, o cifră și un caracter special (@$!%*?&).";
  }

  if (data.password !== data.retype_password) {
    errors.retype_password = "Parolele introduse nu coincid.";
  }

  if (!isRequired(data.institution)) {
    errors.institution = "Vă rugăm să selectați o instituție.";
  }

  return errors;
};