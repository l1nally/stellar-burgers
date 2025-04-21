import { FC, useEffect, useMemo } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../services/store';
import { Preloader } from '../ui/preloader';
import { OrderInfoUI } from '../ui/order-info';
import { TIngredient, TOrder } from '@utils-types';
import styles from '../app/app.module.css';
import {
  selectIngredients,
  selectOrders,
  selectUserOrders,
  fetchFeed,
  fetchUserOrders,
  selectIsAuthenticated
} from '../../slices/stellarBurgerSlice';

type OrderInfoProps = {
  isModal?: boolean;
};

export const OrderInfo: FC<OrderInfoProps> = ({ isModal }) => {
  const { number } = useParams<{ number: string }>();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const ingredients = useAppSelector(selectIngredients);
  const orders = useAppSelector(selectOrders);
  const userOrders = useAppSelector(selectUserOrders);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  const isProfileOrder = location.pathname.includes('/profile');

  useEffect(() => {
    if (isProfileOrder) {
      if (isAuthenticated && !userOrders.length) {
        dispatch(fetchUserOrders());
      }
    } else if (!orders.length) {
      dispatch(fetchFeed());
    }
  }, [
    dispatch,
    orders.length,
    userOrders.length,
    isProfileOrder,
    isAuthenticated
  ]);

  const orderData = useMemo(() => {
    const numericOrderNumber = Number(number);
    let foundOrder: TOrder | undefined;

    if (isProfileOrder) {
      foundOrder = userOrders.find(
        (order) => order.number === numericOrderNumber
      );
    } else {
      foundOrder = orders.find((order) => order.number === numericOrderNumber);
    }

    if (!foundOrder) {
      foundOrder = isProfileOrder
        ? orders.find((order) => order.number === numericOrderNumber)
        : userOrders.find((order) => order.number === numericOrderNumber);
    }

    return foundOrder;
  }, [number, orders, userOrders, isProfileOrder]);

  const orderInfo = useMemo(() => {
    if (!orderData || !ingredients.length) return null;

    const ingredientsInfo = orderData.ingredients.reduce(
      (acc: { [key: string]: TIngredient & { count: number } }, id: string) => {
        const ingredient = ingredients.find((item) => item._id === id);
        if (!ingredient) return acc;

        if (acc[id]) {
          acc[id].count++;
        } else {
          acc[id] = { ...ingredient, count: 1 };
        }
        return acc;
      },
      {}
    );

    const total = Object.values(ingredientsInfo).reduce(
      (sum, item) => sum + item.price * item.count,
      0
    );

    const date = new Date(orderData.createdAt);

    return {
      ingredientsInfo,
      date,
      total,
      ...orderData
    };
  }, [orderData, ingredients]);

  const isLoading =
    !ingredients.length ||
    (isProfileOrder && !userOrders.length) ||
    (!isProfileOrder && !orders.length);

  if (isLoading) {
    return <Preloader />;
  }

  if (!orderInfo) {
    return <div className='text text_type_main-medium'>Заказ не найден</div>;
  }

  if (!isModal) {
    return (
      <div className={styles.detailPageWrap}>
        <p
          className={`${styles.detailHeader} text text_type_digits-default mb-10`}
        >
          #{String(orderInfo.number).padStart(6, '0')}
        </p>
        <OrderInfoUI orderInfo={orderInfo} isModal={isModal} />
      </div>
    );
  }

  return <OrderInfoUI orderInfo={orderInfo} isModal={isModal} />;
};
