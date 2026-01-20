import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { threadCpuUsage } from "process";

@Injectable()
export class JwtGuard implements CanActivate{
  constructor(private readonly jwt: JwtService){}
  async canActivate(context: ExecutionContext):  Promise<boolean> {
      const req= context.switchToHttp().getRequest();

      const authHeader: string | undefined = req.headers["authorization"];
      if(!authHeader) throw new UnauthorizedException("Missing Authorization header");

      const [type, token] = authHeader.split(' ');
      if (type != "Bearer" ||   !token) {
        throw new UnauthorizedException("Invalid Authorization header format");
      }

      try {
        const payload = await this.jwt.verifyAsync(token);
        req.user = payload;
        return true;
      } catch {
        throw new UnauthorizedException('Invalid or expired token')
      }

  }
}