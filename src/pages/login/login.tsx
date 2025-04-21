import { FC, SyntheticEvent, Dispatch, SetStateAction } from 'react';
import { LoginUI } from '@ui-pages';
import { useAppDispatch } from '../../services/store';
import { loginThunk } from '../../slices/stellarBurgerSlice';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from '../../hooks/useForm';

type LoginFormValues = {
  email: string;
  password: string;
  error?: string;
};

export const Login: FC = () => {
  const { values, setValues } = useForm<LoginFormValues>({
    email: '',
    password: '',
    error: undefined
  });
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const setEmail: Dispatch<SetStateAction<string>> = (value) => {
    if (typeof value === 'function') {
      const newValue = value(values.email);
      setValues({ ...values, email: newValue });
    } else {
      setValues({ ...values, email: value });
    }
  };

  const setPassword: Dispatch<SetStateAction<string>> = (value) => {
    if (typeof value === 'function') {
      const newValue = value(values.password);
      setValues({ ...values, password: newValue });
    } else {
      setValues({ ...values, password: value });
    }
  };

  const handleSubmit = async (e: SyntheticEvent) => {
    e.preventDefault();
    setValues({ ...values, error: undefined });
    try {
      await dispatch(
        loginThunk({ email: values.email, password: values.password })
      );
      const { from } = location.state || { from: { pathname: '/' } };
      navigate(from);
    } catch (err) {
      setValues({
        ...values,
        error: err instanceof Error ? err.message : 'Login failed'
      });
    }
  };

  return (
    <LoginUI
      email={values.email}
      setEmail={setEmail}
      password={values.password}
      setPassword={setPassword}
      errorText={values.error}
      handleSubmit={handleSubmit}
    />
  );
};
