import { useState } from 'react';

interface FieldError {
  [key: string]: string | undefined;
}

interface TouchedFields {
  [key: string]: boolean;
}

export const useFormValidation = () => {
  const [errors, setErrors] = useState<FieldError>({});
  const [touched, setTouched] = useState<TouchedFields>({});

  const setFieldError = (field: string, error: string) => {
    setErrors((prev) => ({ ...prev, [field]: error }));
  };

  const clearFieldError = (field: string) => {
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  };

  const setFieldTouched = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const clearAllErrors = () => {
    setErrors({});
  };

  const setMultipleErrors = (newErrors: FieldError) => {
    setErrors(newErrors);
  };

  const touchAllFields = (fields: string[]) => {
    const allTouched = fields.reduce((acc, field) => {
      acc[field] = true;
      return acc;
    }, {} as TouchedFields);
    setTouched(allTouched);
  };

  const hasErrors = () => {
    return Object.keys(errors).length > 0;
  };

  return {
    errors,
    touched,
    setFieldError,
    clearFieldError,
    setFieldTouched,
    clearAllErrors,
    setMultipleErrors,
    touchAllFields,
    hasErrors,
  };
};
