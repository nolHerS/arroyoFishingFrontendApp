import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

/**
 * Interceptor HTTP funcional para Angular 20+
 * Añade el token JWT a todas las peticiones que lo requieran
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  // URLs que NO necesitan token
  const publicUrls = [
    '/api/auth/login',
    '/api/auth/register',
    '/api/fish-captures',
    '/api/users'
  ];

  // Si es una petición pública y es GET, no añadir token
  const isPublicUrl = publicUrls.some(url => req.url.includes(url));
  const isGetRequest = req.method === 'GET';

  if (isPublicUrl && isGetRequest) {
    return next(req);
  }

  // Si hay token, clonamos la petición y añadimos el header Authorization
  const token = authService.getToken();

  if (token) {
    const clonedReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(clonedReq);
  }

  return next(req);
};