import { FC, useState, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '../../services/store';
import { updateUserThunk, selectUser } from '../../slices/stellarBurgerSlice';
import { ProfileUI } from '@ui-pages';

export const Profile: FC = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
    }
  }, [user]);

  const isFormChanged =
    name !== user?.name || email !== user?.email || password.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const updateData: { name?: string; email?: string; password?: string } =
        {};

      if (name !== user?.name) updateData.name = name;
      if (email !== user?.email) updateData.email = email;
      if (password) updateData.password = password;

      await dispatch(updateUserThunk(updateData));
      setPassword(''); // Clear password after successful update
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    }
  };

  const handleCancel = () => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
    }
    setPassword('');
    setError(null);
  };

  return (
    <ProfileUI
      name={name}
      setName={setName}
      email={email}
      setEmail={setEmail}
      password={password}
      setPassword={setPassword}
      handleSubmit={handleSubmit}
      handleCancel={handleCancel}
      isFormChanged={isFormChanged}
      errorText={error}
    />
  );
};
