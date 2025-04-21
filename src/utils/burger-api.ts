import { setCookie, getCookie } from './cookie';
import { TIngredient, TOrder } from './types';

const NORMA_API = '/api';

type TServerResponse<T> = {
  success: boolean;
} & T;

type TUserResponse = TServerResponse<{
  user: TUser;
  accessToken: string;
  refreshToken: string;
}>;

type TRefreshResponse = TServerResponse<{
  accessToken: string;
  refreshToken: string;
}>;

type TUser = {
  email: string;
  name: string;
};

export type TLoginData = {
  email: string;
  password: string;
};

export type TRegisterData = TLoginData & {
  name: string;
};

type TEmptyResponse = TServerResponse<Record<string, never>>;

export type TFeedsResponse = TServerResponse<{
  orders: TOrder[];
  total: number;
  totalToday: number;
}>;

export const checkResponse = <T>(res: Response): Promise<T> =>
  res.ok ? res.json() : res.json().then((err) => Promise.reject(err));

export const request = <T>(
  endpoint: string,
  options: RequestInit
): Promise<T> => {
  const defaultOptions: RequestInit = {
    mode: 'cors',
    cache: 'no-cache',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json'
    }
  };

  const mergedOptions = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers
    }
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

  return fetch(`${NORMA_API}${endpoint}`, {
    ...mergedOptions,
    signal: controller.signal
  })
    .then((res) => {
      clearTimeout(timeoutId);
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      return res.json();
    })
    .catch((err) => {
      clearTimeout(timeoutId);
      console.error('Request failed:', err);
      throw err;
    });
};

export const refreshToken = (): Promise<TRefreshResponse> =>
  request<TRefreshResponse>('/auth/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json;charset=utf-8'
    },
    body: JSON.stringify({
      token: localStorage.getItem('refreshToken')
    })
  }).then((refreshData) => {
    if (!refreshData.success) {
      return Promise.reject(refreshData);
    }
    localStorage.setItem('refreshToken', refreshData.refreshToken);
    const token = refreshData.accessToken.replace('Bearer ', '');
    setCookie('accessToken', token, { expires: 86400 });
    return refreshData;
  });

export const fetchWithRefresh = async <T>(
  endpoint: string,
  options: RequestInit
): Promise<T> => {
  try {
    return await request<T>(endpoint, options);
  } catch (err) {
    if ((err as { message: string }).message === 'jwt expired') {
      const refreshData = await refreshToken();
      if (!refreshData.success) {
        return Promise.reject(refreshData);
      }
      options.headers = {
        ...options.headers,
        Authorization: refreshData.accessToken
      };
      return await request<T>(endpoint, options);
    } else {
      return Promise.reject(err);
    }
  }
};

export const getIngredientsApi = (): Promise<TIngredient[]> =>
  request<TServerResponse<{ data: TIngredient[] }>>('/ingredients', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  }).then((data) => data.data);

export const loginUserApi = (form: TLoginData): Promise<TUserResponse> =>
  request<TUserResponse>('/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(form)
  });

export const registerUserApi = (form: TRegisterData): Promise<TUserResponse> =>
  request<TUserResponse>('/auth/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(form)
  });

export const logoutApi = (): Promise<TEmptyResponse> =>
  request<TEmptyResponse>('/auth/logout', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      token: localStorage.getItem('refreshToken')
    })
  });

export const getUserApi = (): Promise<TUserResponse> => {
  const token = getCookie('accessToken');
  if (!token) {
    return Promise.reject(new Error('No token found'));
  }
  return fetchWithRefresh<TUserResponse>('/auth/user', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + token
    }
  });
};

export const updateUserApi = (
  form: Partial<TRegisterData>
): Promise<TUserResponse> => {
  const token = getCookie('accessToken');
  if (!token) {
    return Promise.reject(new Error('No token found'));
  }
  return fetchWithRefresh<TUserResponse>('/auth/user', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + token
    },
    body: JSON.stringify(form)
  });
};

export const forgotPasswordApi = (form: {
  email: string;
}): Promise<TEmptyResponse> =>
  request<TEmptyResponse>('/password-reset', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(form)
  });

export const resetPasswordApi = (form: {
  password: string;
  token: string;
}): Promise<TEmptyResponse> =>
  request<TEmptyResponse>('/password-reset/reset', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(form)
  });

export const orderBurgerApi = (
  ingredients: string[]
): Promise<{ order: TOrder }> => {
  const token = getCookie('accessToken');
  if (!token) {
    return Promise.reject(new Error('No token found'));
  }
  return fetchWithRefresh<TServerResponse<{ order: TOrder }>>('/orders', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + token
    },
    body: JSON.stringify({ ingredients })
  }).then((data) => ({ order: data.order }));
};

export const getUserOrdersApi = (): Promise<TFeedsResponse> => {
  const token = getCookie('accessToken');
  if (!token) {
    return Promise.reject(new Error('No token found'));
  }
  return fetchWithRefresh<TFeedsResponse>('/orders/user', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + token
    }
  });
};

export const getFeedsApi = (): Promise<TFeedsResponse> =>
  request<TFeedsResponse>('/orders/all', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  });
