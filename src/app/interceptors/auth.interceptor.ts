import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  console.log('🔍 INTERCEPTOR - URL:', req.url);
  console.log('🔍 INTERCEPTOR - Método:', req.method);

  const authService = inject(AuthService);

  // URLs completamente públicas (sin token nunca)
  const alwaysPublicUrls = [
    '/api/auth/login',
    '/api/auth/register',
    '/api/auth/refresh'
  ];

  // URLs públicas solo para GET (EXACTAS, sin parámetros adicionales)
  const publicGetEndpoints = [
    '/api/fish-captures',
    '/api/users'
  ];

  // Verificar si es una URL completamente pública
  const isAlwaysPublic = alwaysPublicUrls.some(url => req.url.includes(url));
  console.log('🔍 INTERCEPTOR - Es always public?:', isAlwaysPublic);

  if (isAlwaysPublic) {
    console.log('⏭️ INTERCEPTOR - Saltando (always public)');
    return next(req);
  }

  // Verificar si es una URL pública solo para GET
  // IMPORTANTE: Solo debe ser público si la URL termina EXACTAMENTE en el endpoint
  const isPublicGet = req.method === 'GET' && publicGetEndpoints.some(endpoint => {
    try {
      const url = new URL(req.url);
      // La URL debe terminar exactamente en el endpoint, sin /algo/mas
      return url.pathname === endpoint;
    } catch {
      // Si falla el parseo, usar includes como fallback
      return req.url.endsWith(endpoint);
    }
  });

  console.log('🔍 INTERCEPTOR - Es public GET?:', isPublicGet);

  if (isPublicGet) {
    console.log('⏭️ INTERCEPTOR - Saltando (public GET)');
    return next(req);
  }

  // Para todas las demás peticiones, añadir token si existe
  const token = authService.getToken();
  console.log('🔍 INTERCEPTOR - Token:', token ? `✅ SÍ (primeros chars: ${token.substring(0, 20)}...)` : '❌ NO');

  if (token) {
    console.log('✅ INTERCEPTOR - Añadiendo header Authorization');
    const clonedReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(clonedReq);
  }

  console.log('⚠️ INTERCEPTOR - Sin token, continuando sin Authorization header');
  return next(req);
};