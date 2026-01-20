import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { JwtGuard } from "./guards/jwt.guard";

@Module({
  imports:[
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions:{
        algorithm:'HS256',
      },
    }),
  ],
  providers:[JwtGuard],
  exports:[JwtGuard],
})

export class AuthModule {}