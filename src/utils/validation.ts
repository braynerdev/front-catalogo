export const validateLoginForm = (username: string, password: string) => {
  const errors = {
    username: '',
    password: '',
  };

  if (!username.trim()) {
    errors.username = 'Usuário é obrigatório';
  }

  if (!password.trim()) {
    errors.password = 'Senha é obrigatória';
  } else if (password.length < 3) {
    errors.password = 'Senha deve ter no mínimo 3 caracteres';
  }

  return {
    isValid: !errors.username && !errors.password,
    errors,
  };
};

interface RegisterFormErrors {
  [key: string]: string | undefined;
  name?: string;
  username?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

export const validateRegisterForm = (
  name: string,
  username: string,
  email: string,
  password: string,
  confirmPassword: string
) => {
  const errors: RegisterFormErrors = {};

  if (!name.trim()) {
    errors.name = 'Nome é obrigatório';
  } else if (name.trim().length < 3) {
    errors.name = 'Nome deve ter no mínimo 3 caracteres';
  }

  if (!username.trim()) {
    errors.username = 'Usuário é obrigatório';
  } else if (username.trim().length < 3) {
    errors.username = 'Usuário deve ter no mínimo 3 caracteres';
  } else if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    errors.username = 'Usuário deve conter apenas letras, números e underline';
  }

  if (!email.trim()) {
    errors.email = 'Email é obrigatório';
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      errors.email = 'Email inválido';
    }
  }

  if (!password) {
    errors.password = 'Senha é obrigatória';
  } else if (password.length < 6) {
    errors.password = 'Senha deve ter no mínimo 6 caracteres';
  } else if (!/(?=.*[a-z])/.test(password)) {
    errors.password = 'Senha deve conter pelo menos uma letra minúscula';
  } else if (!/(?=.*[A-Z])/.test(password)) {
    errors.password = 'Senha deve conter pelo menos uma letra maiúscula';
  } else if (!/(?=.*[0-9])/.test(password)) {
    errors.password = 'Senha deve conter pelo menos um número';
  }

  if (!confirmPassword) {
    errors.confirmPassword = 'Confirmação de senha é obrigatória';
  } else if (password !== confirmPassword) {
    errors.confirmPassword = 'As senhas não coincidem';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};
