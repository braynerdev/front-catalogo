interface BackendError {
  message: string;
  errors?: {
    [key: string]: string[];
  };
}

interface ParsedErrors {
  [key: string]: string;
}

const FIELD_KEYWORDS = {
  username: ['username', 'usuário', 'usuario', 'user'],
  email: ['email', 'e-mail'],
  password: ['senha', 'password', 'pass'],
  name: ['nome', 'name'],
  confirmPassword: ['confirma', 'confirmation'],
};

const detectFieldFromMessage = (message: string): string | null => {
  const lowerMessage = message.toLowerCase();
  
  for (const [field, keywords] of Object.entries(FIELD_KEYWORDS)) {
    if (keywords.some(keyword => lowerMessage.includes(keyword))) {
      return field;
    }
  }
  
  return null;
};

export const parseBackendErrors = (error: any): ParsedErrors => {
  const parsedErrors: ParsedErrors = {};

  console.log('Parsing backend error:', {
    hasResponse: !!error?.response,
    hasData: !!error?.response?.data,
    data: error?.response?.data,
  });

  if (!error?.response?.data) {
    return parsedErrors;
  }

  const data = error.response.data;

  if (data.errors && typeof data.errors === 'object') {
    Object.keys(data.errors).forEach((key) => {
      const fieldName = key.toLowerCase();
      const errorMessages = data.errors[key];
      
      if (Array.isArray(errorMessages) && errorMessages.length > 0) {
        parsedErrors[fieldName] = errorMessages[0];
      } else if (typeof errorMessages === 'string') {
        parsedErrors[fieldName] = errorMessages;
      }
    });
  }

  if (data.message && typeof data.message === 'string') {
    const detectedField = detectFieldFromMessage(data.message);
    
    if (detectedField) {
      if (!parsedErrors[detectedField]) {
        parsedErrors[detectedField] = data.message;
      }
    }
  }

  console.log('Parsed errors:', parsedErrors);

  return parsedErrors;
};

export const getErrorMessage = (error: any): string => {
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }
  
  if (error?.response?.data?.errors) {
    const firstError = Object.values(error.response.data.errors)[0];
    if (Array.isArray(firstError) && firstError.length > 0) {
      return firstError[0];
    }
    if (typeof firstError === 'string') {
      return firstError;
    }
  }
  
  if (error?.message) {
    return error.message;
  }
  
  return 'Erro desconhecido';
};

export const hasBackendFieldErrors = (error: any): boolean => {
  const parsedErrors = parseBackendErrors(error);
  return Object.keys(parsedErrors).length > 0;
};
