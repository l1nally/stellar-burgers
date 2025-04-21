import { useState, useRef, useEffect, FC, useCallback } from 'react';
import { useInView } from 'react-intersection-observer';
import { useAppSelector, useAppDispatch } from '../../services/store';
import {
  fetchIngredients,
  selectIngredients
} from '../../slices/stellarBurgerSlice';

import { TTabMode } from '@utils-types';
import { BurgerIngredientsUI } from '../ui/burger-ingredients';

export const BurgerIngredients: FC = () => {
  const dispatch = useAppDispatch();
  const ingredients = useAppSelector(selectIngredients);
  const isLoading = useAppSelector(
    (state) => state.stellarBurger.ingredientsRequest
  );

  useEffect(() => {
    if (!isLoading && ingredients.length === 0) {
      dispatch(fetchIngredients());
    }
  }, [dispatch, isLoading, ingredients]);

  const buns = ingredients.filter(
    (item: { type: string }) => item.type === 'bun'
  );
  const mains = ingredients.filter(
    (item: { type: string }) => item.type === 'main'
  );
  const sauces = ingredients.filter(
    (item: { type: string }) => item.type === 'sauce'
  );

  const [currentTab, setCurrentTab] = useState<TTabMode>('bun');
  const titleBunRef = useRef<HTMLHeadingElement>(null);
  const titleMainRef = useRef<HTMLHeadingElement>(null);
  const titleSaucesRef = useRef<HTMLHeadingElement>(null);

  const [bunsRef, inViewBuns] = useInView({
    threshold: 0,
    rootMargin: '-20px 0px -80% 0px'
  });

  const [mainsRef, inViewFilling] = useInView({
    threshold: 0,
    rootMargin: '-20px 0px -80% 0px'
  });

  const [saucesRef, inViewSauces] = useInView({
    threshold: 0,
    rootMargin: '-20px 0px -80% 0px'
  });

  const handleTabVisibilityChange = useCallback(() => {
    if (inViewBuns) {
      setCurrentTab('bun');
    } else if (inViewSauces) {
      setCurrentTab('sauce');
    } else if (inViewFilling) {
      setCurrentTab('main');
    }
  }, [inViewBuns, inViewFilling, inViewSauces]);

  useEffect(() => {
    handleTabVisibilityChange();
  }, [handleTabVisibilityChange]);

  const onTabClick = useCallback((tab: string) => {
    setCurrentTab(tab as TTabMode);
    if (tab === 'bun')
      titleBunRef.current?.scrollIntoView({ behavior: 'smooth' });
    if (tab === 'main')
      titleMainRef.current?.scrollIntoView({ behavior: 'smooth' });
    if (tab === 'sauce')
      titleSaucesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  return (
    <BurgerIngredientsUI
      currentTab={currentTab}
      buns={buns}
      mains={mains}
      sauces={sauces}
      titleBunRef={titleBunRef}
      titleMainRef={titleMainRef}
      titleSaucesRef={titleSaucesRef}
      bunsRef={bunsRef}
      mainsRef={mainsRef}
      saucesRef={saucesRef}
      onTabClick={onTabClick}
    />
  );
};
