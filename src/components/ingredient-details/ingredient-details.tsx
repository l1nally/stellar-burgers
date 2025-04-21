import { FC } from 'react';
import { useParams } from 'react-router-dom';
import { useAppSelector } from '../../services/store';
import { Preloader } from '../ui/preloader';
import { IngredientDetailsUI } from '../ui/ingredient-details';
import { selectIngredients } from '../../slices/stellarBurgerSlice';
import styles from '../app/app.module.css';

type IngredientDetailsProps = {
  isModal?: boolean;
};

export const IngredientDetails: FC<IngredientDetailsProps> = ({ isModal }) => {
  const { id } = useParams<{ id: string }>();
  const ingredients = useAppSelector(selectIngredients);
  const ingredientData = ingredients.find((item) => item._id === id);

  if (!ingredientData) {
    return <Preloader />;
  }

  if (!isModal) {
    return (
      <div className={styles.detailPageWrap}>
        <h1
          className={`${styles.detailHeader} text text_type_main-large mb-10`}
        >
          Детали ингредиента
        </h1>
        <IngredientDetailsUI
          ingredientData={ingredientData}
          isModal={isModal}
        />
      </div>
    );
  }

  return (
    <IngredientDetailsUI ingredientData={ingredientData} isModal={isModal} />
  );
};
