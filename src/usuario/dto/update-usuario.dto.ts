export class UpdateUsuarioDto {
    @IsString()
    @IsOptional()
    cedula_usuario?: string

    @IsString()
    @IsOptional()
    apellidos_usuario?: string

    @IsString()
    @IsOptional()
    nombre_usuario?: string

    @IsString()
    @IsOptional()
    correo_usuario?: string

    @IsString()
    @IsOptional()
    contrasenia_usuario?: string
}
