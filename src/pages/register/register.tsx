import { FC, SyntheticEvent, useState } from 'react';
import { RegisterUI } from '@ui-pages';
import { useAppDispatch } from '../../services/store';
import { registerThunk } from '../../slices/stellarBurgerSlice';
import { useNavigate } from 'react-router-dom';

export const Register: FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e: SyntheticEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await dispatch(registerThunk({ email, password, name }));
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    }
  };

  return (
    <RegisterUI
      errorText={error}
      email={email}
      name={name}
      password={password}
      setEmail={setEmail}
      setPassword={setPassword}
      setName={setName}
      handleSubmit={handleSubmit}
    />
  );
};
