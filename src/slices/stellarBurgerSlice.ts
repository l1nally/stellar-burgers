import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../services/store';
import {
  getIngredients,
  getFeeds,
  getUserOrders,
  orderBurgerApi,
  loginUser,
  registerUser,
  logout as logoutApi,
  getUser,
  updateUser,
  forgotPassword as forgotPasswordApi,
  resetPassword as resetPasswordApi
} from '../utils/api-utils';
import { deleteCookie, setCookie } from '../utils/cookie';
import {
  TIngredient,
  TOrder,
  TUser,
  TLoginForm,
  TRegisterForm,
  TUserForm,
  TResetPasswordForm
} from '../utils/types';
import { v4 as uuidv4 } from 'uuid';

export type TConstructorIngredient = TIngredient & { uuid: string; id: string };

interface StellarBurgerState {
  user: TUser | null;
  isAuthenticated: boolean;
  authRequest: boolean;
  authFailed: boolean;
  ingredients: TIngredient[];
  ingredientsRequest: boolean;
  ingredientsFailed: boolean;
  constructorIngredients: TConstructorIngredient[];
  bun: TIngredient | null;
  order: TOrder | null;
  orderRequest: boolean;
  orderFailed: boolean;
  orders: TOrder[];
  feedRequest: boolean;
  feedFailed: boolean;
  total: number;
  totalToday: number;
  userOrders: TOrder[];
  userOrdersRequest: boolean;
  userOrdersFailed: boolean;
  isModalOpened: boolean;
  forgotPasswordSuccess: boolean;
  resetPasswordSuccess: boolean;
}

const initialState: StellarBurgerState = {
  user: null,
  isAuthenticated: false,
  authRequest: false,
  authFailed: false,
  ingredients: [],
  ingredientsRequest: false,
  ingredientsFailed: false,
  constructorIngredients: [],
  bun: null,
  order: null,
  orderRequest: false,
  orderFailed: false,
  orders: [],
  feedRequest: false,
  feedFailed: false,
  total: 0,
  totalToday: 0,
  userOrders: [],
  userOrdersRequest: false,
  userOrdersFailed: false,
  isModalOpened: false,
  forgotPasswordSuccess: false,
  resetPasswordSuccess: false
};

export const fetchIngredients = createAsyncThunk(
  'stellarBurger/fetchIngredients',
  getIngredients
);

export const fetchFeed = createAsyncThunk('stellarBurger/fetchFeed', getFeeds);

export const fetchUserOrders = createAsyncThunk(
  'stellarBurger/fetchUserOrders',
  getUserOrders
);

export const createOrderThunk = createAsyncThunk(
  'stellarBurger/createOrder',
  async (ingredientIds: string[]) => {
    const response = await orderBurgerApi(ingredientIds);
    return response.order;
  }
);

export const loginThunk = createAsyncThunk(
  'stellarBurger/login',
  async (form: TLoginForm) => {
    const response = await loginUser(form);
    if (response.success) {
      const token = response.accessToken.replace('Bearer ', '');
      setCookie('accessToken', token, { expires: 86400 });
      localStorage.setItem('refreshToken', response.refreshToken);
    }
    return response.user;
  }
);

export const registerThunk = createAsyncThunk(
  'stellarBurger/register',
  async (form: TRegisterForm) => {
    const response = await registerUser(form);
    if (response.success) {
      const token = response.accessToken.replace('Bearer ', '');
      setCookie('accessToken', token, { expires: 86400 });
      localStorage.setItem('refreshToken', response.refreshToken);
    }
    return response.user;
  }
);

export const logoutThunk = createAsyncThunk(
  'stellarBurger/logout',
  async () => {
    await logoutApi();
    deleteCookie('accessToken');
    localStorage.removeItem('refreshToken');
  }
);

export const getUserThunk = createAsyncThunk(
  'stellarBurger/getUser',
  async () => {
    const response = await getUser();
    return response.user;
  }
);

export const updateUserThunk = createAsyncThunk(
  'stellarBurger/updateUser',
  async (form: TUserForm) => {
    const response = await updateUser(form);
    return response.user;
  }
);

export const forgotPasswordThunk = createAsyncThunk(
  'stellarBurger/forgotPassword',
  async (email: string) => {
    const response = await forgotPasswordApi({ email });
    return response.success;
  }
);

export const resetPasswordThunk = createAsyncThunk(
  'stellarBurger/resetPassword',
  async (form: TResetPasswordForm) => {
    const response = await resetPasswordApi(form);
    return response.success;
  }
);

const stellarBurgerSlice = createSlice({
  name: 'stellarBurger',
  initialState,
  reducers: {
    init: (state) => {
      state.isAuthenticated = !!state.user;
    },
    addIngredient: {
      reducer: (state, action: PayloadAction<TConstructorIngredient>) => {
        if (action.payload.type === 'bun') {
          state.bun = action.payload;
        } else {
          state.constructorIngredients.push(action.payload);
        }
      },
      prepare: (ingredient: TIngredient) => ({
        payload: {
          ...ingredient,
          uuid: uuidv4(),
          id: ingredient._id
        }
      })
    },
    addBun: (state, action: PayloadAction<TIngredient>) => {
      state.bun = action.payload;
    },
    resetConstructor: (state) => {
      state.constructorIngredients = [];
      state.bun = null;
    },
    removeIngredient: (state, action: PayloadAction<string>) => {
      state.constructorIngredients = state.constructorIngredients.filter(
        (item) => item.uuid !== action.payload
      );
    },
    moveIngredient: (
      state,
      action: PayloadAction<{ dragIndex: number; hoverIndex: number }>
    ) => {
      const { dragIndex, hoverIndex } = action.payload;
      const dragItem = state.constructorIngredients[dragIndex];
      const newConstructorIngredients = [...state.constructorIngredients];
      newConstructorIngredients.splice(dragIndex, 1);
      newConstructorIngredients.splice(hoverIndex, 0, dragItem);
      state.constructorIngredients = newConstructorIngredients;
    },
    clearConstructor: (state) => {
      state.constructorIngredients = [];
      state.bun = null;
    },
    openModal: (state) => {
      state.isModalOpened = true;
    },
    closeModal: (state) => {
      state.isModalOpened = false;
    },
    resetOrder: (state) => {
      state.order = null;
    },
    resetPasswordStates: (state) => {
      state.forgotPasswordSuccess = false;
      state.resetPasswordSuccess = false;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchIngredients.pending, (state) => {
        state.ingredientsRequest = true;
        state.ingredientsFailed = false;
      })
      .addCase(fetchIngredients.fulfilled, (state, action) => {
        state.ingredients = action.payload;
        state.ingredientsRequest = false;
      })
      .addCase(fetchIngredients.rejected, (state) => {
        state.ingredientsRequest = false;
        state.ingredientsFailed = true;
      });
    builder
      .addCase(fetchFeed.pending, (state) => {
        state.feedRequest = true;
        state.feedFailed = false;
      })
      .addCase(fetchFeed.fulfilled, (state, action) => {
        state.orders = action.payload.orders;
        state.total = action.payload.total;
        state.totalToday = action.payload.totalToday;
        state.feedRequest = false;
      })
      .addCase(fetchFeed.rejected, (state) => {
        state.feedRequest = false;
        state.feedFailed = true;
      });
    builder
      .addCase(fetchUserOrders.pending, (state) => {
        state.userOrdersRequest = true;
        state.userOrdersFailed = false;
      })
      .addCase(fetchUserOrders.fulfilled, (state, action) => {
        state.userOrders = action.payload.orders;
        state.userOrdersRequest = false;
      })
      .addCase(fetchUserOrders.rejected, (state) => {
        state.userOrdersRequest = false;
        state.userOrdersFailed = true;
      });
    builder
      .addCase(createOrderThunk.pending, (state) => {
        state.orderRequest = true;
        state.orderFailed = false;
      })
      .addCase(createOrderThunk.fulfilled, (state, action) => {
        state.order = action.payload;
        state.orderRequest = false;
        state.isModalOpened = true;
      })
      .addCase(createOrderThunk.rejected, (state) => {
        state.orderRequest = false;
        state.orderFailed = true;
      });
    builder
      .addCase(loginThunk.pending, (state) => {
        state.authRequest = true;
        state.authFailed = false;
      })
      .addCase(loginThunk.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = true;
        state.authRequest = false;
      })
      .addCase(loginThunk.rejected, (state) => {
        state.authRequest = false;
        state.authFailed = true;
      });
    builder
      .addCase(registerThunk.pending, (state) => {
        state.authRequest = true;
        state.authFailed = false;
      })
      .addCase(registerThunk.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = true;
        state.authRequest = false;
      })
      .addCase(registerThunk.rejected, (state) => {
        state.authRequest = false;
        state.authFailed = true;
      });
    builder.addCase(logoutThunk.fulfilled, (state) => {
      state.user = null;
      state.isAuthenticated = false;
    });
    builder
      .addCase(getUserThunk.pending, (state) => {
        state.authRequest = true;
        state.authFailed = false;
      })
      .addCase(getUserThunk.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = true;
        state.authRequest = false;
      })
      .addCase(getUserThunk.rejected, (state) => {
        state.authRequest = false;
        state.authFailed = true;
      });
    builder
      .addCase(updateUserThunk.pending, (state) => {
        state.authRequest = true;
        state.authFailed = false;
      })
      .addCase(updateUserThunk.fulfilled, (state, action) => {
        state.user = action.payload;
        state.authRequest = false;
      })
      .addCase(updateUserThunk.rejected, (state) => {
        state.authRequest = false;
        state.authFailed = true;
      });
    builder.addCase(forgotPasswordThunk.fulfilled, (state, action) => {
      state.forgotPasswordSuccess = action.payload;
    });
    builder.addCase(resetPasswordThunk.fulfilled, (state, action) => {
      state.resetPasswordSuccess = action.payload;
    });
  }
});

export const {
  init,
  addIngredient,
  addBun,
  resetConstructor,
  removeIngredient,
  moveIngredient,
  clearConstructor,
  openModal,
  closeModal,
  resetOrder,
  resetPasswordStates
} = stellarBurgerSlice.actions;

export const selectIngredients = (state: RootState) =>
  state.stellarBurger.ingredients;
export const selectConstructorIngredients = (state: RootState) =>
  state.stellarBurger.constructorIngredients;
export const selectBun = (state: RootState) => state.stellarBurger.bun;
export const selectOrder = (state: RootState) => state.stellarBurger.order;
export const selectOrders = (state: RootState) => state.stellarBurger.orders;
export const selectUserOrders = (state: RootState) =>
  state.stellarBurger.userOrders;
export const selectUser = (state: RootState) => state.stellarBurger.user;
export const selectIsAuthenticated = (state: RootState) =>
  state.stellarBurger.isAuthenticated;
export const selectAuthRequest = (state: RootState) =>
  state.stellarBurger.authRequest;
export const selectAuthFailed = (state: RootState) =>
  state.stellarBurger.authFailed;
export const selectIsModalOpened = (state: RootState) =>
  state.stellarBurger.isModalOpened;
export const selectForgotPasswordSuccess = (state: RootState) =>
  state.stellarBurger.forgotPasswordSuccess;
export const selectResetPasswordSuccess = (state: RootState) =>
  state.stellarBurger.resetPasswordSuccess;

export default stellarBurgerSlice.reducer;
