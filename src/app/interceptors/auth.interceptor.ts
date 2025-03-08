import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem("accessToken") ?? "";

  const cloneRequest = req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`,
    }
  })
  return next(cloneRequest);
};