import { FC } from 'react';

import { Button, Input } from '@zlden/react-developer-burger-ui-components';
import styles from './profile.module.css';
import commonStyles from '../common.module.css';

import { ProfileUIProps } from './type';
import { ProfileMenu } from '@components';

export const ProfileUI: FC<ProfileUIProps> = ({
  name,
  setName,
  email,
  setEmail,
  password,
  setPassword,
  handleSubmit,
  handleCancel,
  isFormChanged,
  errorText
}) => (
  <main className={commonStyles.container}>
    <div className={`mt-30 mr-15 ${styles.menu}`}>
      <ProfileMenu />
    </div>
    <div className={styles.wrapCenter}>
      <form
        className={`pb-15 ${styles.form} ${commonStyles.form}`}
        name='profile'
        onSubmit={handleSubmit}
      >
        <>
          <div className='pb-6'>
            <Input
              type='text'
              placeholder='Имя'
              onChange={(e) => setName(e.target.value)}
              value={name}
              name='name'
              error={false}
              errorText=''
              size='default'
              icon='EditIcon'
            />
          </div>
          <div className='pb-6'>
            <Input
              type='email'
              placeholder='Логин'
              onChange={(e) => setEmail(e.target.value)}
              value={email}
              name='email'
              error={false}
              errorText=''
              size='default'
              icon='EditIcon'
            />
          </div>
          <div className='pb-6'>
            <Input
              type='password'
              placeholder='Пароль'
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              name='password'
              error={false}
              errorText=''
              size='default'
              icon='EditIcon'
            />
          </div>
          {errorText && (
            <p className='text text_type_main-default text_color_error mb-4'>
              {errorText}
            </p>
          )}
          {isFormChanged && (
            <div className={styles.button}>
              <Button
                type='secondary'
                htmlType='button'
                size='medium'
                onClick={handleCancel}
              >
                Отменить
              </Button>
              <Button type='primary' size='medium' htmlType='submit'>
                Сохранить
              </Button>
            </div>
          )}
        </>
      </form>
    </div>
  </main>
);
