import Cookies from 'js-cookie';

export interface CookieOptions {
  expires?: number | Date;
  path?: string;
  domain?: string;
  secure?: boolean;
  sameSite?: 'strict' | 'lax' | 'none';
  [key: string]: unknown;
}

export const cookieManager = {
  get: (key: string): string | undefined => Cookies.get(key),
  
  set: (key: string, value: string, options?: Partial<CookieOptions>): void => {
    Cookies.set(key, value, {
      expires: 7,
      path: '/',
      sameSite: 'strict',
      ...options,
    });
  },
  
  remove: (key: string, options?: Pick<CookieOptions, 'path' | 'domain'>): void => {
    const removeOptions = {
      path: '/',
      ...options,
    };
    Cookies.remove(key, removeOptions);
  },
  
  clearAll: (): void => {
    const cookiesToRemove = [
      'access_token',
      'refresh_token',
      'userRole',
      'userId',
      'user_id',
      'token',
      'auth_token',
    ];

    // Remove specific known cookies
    cookiesToRemove.forEach(cookieName => {
      cookieManager.remove(cookieName);
    });

    // Remove any remaining cookies
    const allCookies = Object.keys(Cookies.get());
    allCookies.forEach(cookieName => {
      cookieManager.remove(cookieName);
    });
  },
};