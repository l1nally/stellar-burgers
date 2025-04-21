import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Ingredient {
  _id: string;
  name: string;
  type: string;
  proteins: number;
  fat: number;
  carbohydrates: number;
  calories: number;
  price: number;
  image: string;
  image_mobile: string;
  image_large: string;
  __v: number;
}

interface ConstructorState {
  bun: Ingredient | null;
  main: Ingredient[];
}

export const initialState: ConstructorState = {
  bun: null,
  main: []
};

export const constructorSlice = createSlice({
  name: 'constructor',
  initialState,
  reducers: {
    addIngredient: (
      state,
      action: PayloadAction<{ ingredient: Ingredient; type: 'bun' | 'main' }>
    ) => {
      if (action.payload.type === 'bun') {
        state.bun = action.payload.ingredient;
      } else {
        state.main.push(action.payload.ingredient);
      }
    },
    removeIngredient: (state, action: PayloadAction<number>) => {
      state.main.splice(action.payload, 1);
    },
    moveIngredient: (
      state,
      action: PayloadAction<{ dragIndex: number; hoverIndex: number }>
    ) => {
      const { dragIndex, hoverIndex } = action.payload;
      const [movedItem] = state.main.splice(dragIndex, 1);
      state.main.splice(hoverIndex, 0, movedItem);
    }
  }
});

export const { addIngredient, removeIngredient, moveIngredient } =
  constructorSlice.actions;

export const constructorReducer = constructorSlice.reducer;
