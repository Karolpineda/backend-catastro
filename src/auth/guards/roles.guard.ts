import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);
    
    if (!requiredRoles) {
      return true;
    }
    
    const { user } = context.switchToHttp().getRequest();
    
    // Debug logs
    console.log('Usuario en guard:', user);
    console.log('Roles requeridos:', requiredRoles);
    
    // Extraer los roles de la estructura de la entidad
    let userRoles: string[] = [];
    
    if (user?.roles_usuario && Array.isArray(user.roles_usuario)) {
      userRoles = user.roles_usuario.map((rolUsuario: any) => {
        // Extraer el nombre del rol de la relación
        return rolUsuario.rol?.nombre_rol;
      }).filter(Boolean); // Filtrar valores undefined/null
    }
    
    console.log('Roles del usuario extraídos:', userRoles);
    
    // Verificar si el usuario tiene al menos uno de los roles requeridos
    const hasRequiredRole = requiredRoles.some(role => userRoles.includes(role));
    
    console.log('Tiene rol requerido:', hasRequiredRole);
    
    return hasRequiredRole;
  }
}