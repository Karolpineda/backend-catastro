export interface JwtPayload {
  correo_usuario: string;
  nombre_usuario: string;
  apellido_usuario: string;
  roles: string[];
  iat?: number;
  exp?: number;
}
