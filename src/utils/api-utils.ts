import {
  TIngredient,
  TOrdersData,
  TUser,
  TLoginForm,
  TRegisterForm,
  TResetPasswordForm,
  TUserForm,
  TOrder
} from './types';
import { getCookie, setCookie } from './cookie';

export const BASE_URL = 'https://norma.nomoreparties.space/api';

export interface ApiResponse {
  success: boolean;
  [key: string]: unknown;
}

export interface UserResponse extends ApiResponse {
  user: TUser;
  accessToken: string;
  refreshToken: string;
}

export interface OrderResponse extends ApiResponse {
  order: TOrder;
}

const checkResponse = <T>(res: Response): Promise<T> => {
  if (res.ok) {
    return res.json();
  }
  return Promise.reject(`Error ${res.status}`);
};

const checkSuccess = <T extends ApiResponse>(res: T): T => {
  if (res && res.success) {
    return res;
  }
  return Promise.reject(
    `Response not successful: ${JSON.stringify(res)}`
  ) as never;
};

export const request = <T extends ApiResponse>(
  endpoint: string,
  options?: RequestInit
): Promise<T> =>
  fetch(`${BASE_URL}/${endpoint}`, options)
    .then((res) => checkResponse<T>(res))
    .then((res) => checkSuccess<T>(res));

export const refreshToken = () =>
  request<UserResponse>('auth/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      token: localStorage.getItem('refreshToken')
    })
  });

export const fetchWithRefresh = async <T extends ApiResponse>(
  endpoint: string,
  options: RequestInit
): Promise<T> => {
  try {
    return await request<T>(endpoint, options);
  } catch (err) {
    if ((err as Error).message === 'jwt expired') {
      const refreshData = await refreshToken();
      if (!refreshData.success) {
        return Promise.reject(refreshData);
      }
      localStorage.setItem('refreshToken', refreshData.refreshToken);
      setCookie('accessToken', refreshData.accessToken);

      const headers = options.headers as Record<string, string>;
      headers.Authorization = refreshData.accessToken;

      return await request<T>(endpoint, options);
    } else {
      return Promise.reject(err);
    }
  }
};

export const getIngredients = () =>
  request<ApiResponse & { data: TIngredient[] }>('ingredients').then(
    (response) => response.data
  );

export const getIngredientsApi = getIngredients;

export const getFeeds = () => request<ApiResponse & TOrdersData>('orders/all');

export const getFeedsApi = getFeeds;

export const getUserOrders = () => {
  const token = getCookie('accessToken');
  if (!token) {
    return Promise.reject(new Error('No token found'));
  }
  return fetchWithRefresh<ApiResponse & TOrdersData>('orders/user', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + token
    }
  });
};

export const getUserOrdersApi = getUserOrders;

export const orderBurger = (ingredients: string[]) => {
  const token = getCookie('accessToken');
  return request<OrderResponse>('orders', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: token ? 'Bearer ' + token : ''
    },
    body: JSON.stringify({ ingredients })
  });
};

export const orderBurgerApi = orderBurger;

export const loginUser = (form: TLoginForm) =>
  request<UserResponse>('auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(form)
  });

export const loginUserApi = loginUser;

export const registerUser = (form: TRegisterForm) =>
  request<UserResponse>('auth/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(form)
  });

export const registerUserApi = registerUser;

export const logout = () =>
  request<ApiResponse>('auth/logout', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      token: localStorage.getItem('refreshToken')
    })
  });

export const logoutApi = logout;

export const getUser = () => {
  const token = getCookie('accessToken');
  if (!token) {
    return Promise.reject(new Error('No token found'));
  }
  return fetchWithRefresh<ApiResponse & { user: TUser }>('auth/user', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + token
    }
  });
};

export const getUserApi = getUser;

export const updateUser = (form: TUserForm) => {
  const token = getCookie('accessToken');
  if (!token) {
    return Promise.reject(new Error('No token found'));
  }
  return fetchWithRefresh<ApiResponse & { user: TUser }>('auth/user', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + token
    },
    body: JSON.stringify(form)
  });
};

export const updateUserApi = updateUser;

export const forgotPassword = (emailOrForm: string | { email: string }) => {
  const email =
    typeof emailOrForm === 'string' ? emailOrForm : emailOrForm.email;
  return request<ApiResponse>('password-reset', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email })
  });
};

export const forgotPasswordApi = forgotPassword;

export const resetPassword = (form: TResetPasswordForm) =>
  request<ApiResponse>('password-reset/reset', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(form)
  });

export const resetPasswordApi = resetPassword;
