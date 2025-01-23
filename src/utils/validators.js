const strongRegex = /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
const emailRegex =
  /^([A-Z0-9_+-]+\.?)*[A-Z0-9_+-]@([A-Z0-9][A-Z0-9-]*\.)+[A-Z]{2,}$/i;
export const isStrongPassword = (password) => {
  return strongRegex.test(password);
};

export const isEmail = (email) => {
  return emailRegex.test(email);
};
