import { FC, memo, useEffect } from 'react';
import ReactDOM from 'react-dom';

import { TModalProps } from './type';
import { ModalUI, OrderModalUI } from '@ui';

const modalRoot = document.getElementById('modals');

export const Modal: FC<TModalProps> = memo(
  ({ title, onClose, children, type = 'ingredient' }) => {
    useEffect(() => {
      const handleEsc = (e: KeyboardEvent) => {
        e.key === 'Escape' && onClose();
      };

      document.addEventListener('keydown', handleEsc);
      return () => {
        document.removeEventListener('keydown', handleEsc);
      };
    }, [onClose]);

    const ModalComponent = type === 'order' ? OrderModalUI : ModalUI;

    return ReactDOM.createPortal(
      <ModalComponent title={title} onClose={onClose}>
        {children}
      </ModalComponent>,
      modalRoot as HTMLDivElement
    );
  }
);
