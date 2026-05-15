export interface JwtPayload {
  sub: number;         // Este es el userId real
  email: string;
  exp: number;
  iat?: number;
}
