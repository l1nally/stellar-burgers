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

interface IngredientsState {
  data: Ingredient[];
  isLoading: boolean;
  error: string | null;
}

export const initialState: IngredientsState = {
  data: [],
  isLoading: false,
  error: null
};

export const ingredientsSlice = createSlice({
  name: 'ingredients',
  initialState,
  reducers: {
    getIngredientsRequest: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    getIngredientsSuccess: (state, action: PayloadAction<Ingredient[]>) => {
      state.isLoading = false;
      state.error = null;
      state.data = action.payload;
    },
    getIngredientsFailed: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
      state.data = [];
    }
  }
});

export const {
  getIngredientsRequest,
  getIngredientsSuccess,
  getIngredientsFailed
} = ingredientsSlice.actions;

export const ingredientsReducer = ingredientsSlice.reducer;
