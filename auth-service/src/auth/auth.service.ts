// import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
// import * as bcrypt from 'bcrypt';
// import { DbService } from '../db/db.service';
// import { JwtService } from '@nestjs/jwt';

// @Injectable()
// export class AuthService {
//   constructor(
//     private readonly db: DbService,
//     private readonly jwt: JwtService
//   ) { }

//   async register(email: string, password: string) {
//     const existing = await this.db.query(
//       'SELECT id, email FROM "users" WHERE email = $1 LIMIT 1',
//       [email],
//     );

//     if (existing.rowCount && existing.rows[0]) {
//       throw new ConflictException('User already exists');
//     }

//     const passwordHash = await bcrypt.hash(password, 10);

//     const created = await this.db.query(
//       `INSERT INTO "users"(email, password_hash)
//        VALUES ($1, $2)
//        RETURNING id, email, created_at`,
//       [email, passwordHash],
//     );

//     return created.rows[0];
//   }

//   async login(email: string, password: string) {
//     const result = await this.db.query(
//       'SELECT id, email, password_hash FROM "users" WHERE email = $1 LIMIT 1',
//       [email],
//     );

//     const user = result.rows[0];
//     if (!user) throw new UnauthorizedException('Invalid Credentials');

//     const ok = await bcrypt.compare(password, user.password_hash);
//     if (!ok) throw new UnauthorizedException('Invalid Credentials');

//     // return { id: user.id, email: user.email };

//     const accessToken = await this.jwt.signAsync({
//       sub: user.id,
//       email: user.email
//     })
//     return accessToken;
//   }
// }

// auth-service/src/auth/auth.service.ts

import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { DbService } from '../db/db.service';
import { JwtService } from '@nestjs/jwt';
import * as crypto from 'crypto';
import { JwtSignOptions } from '@nestjs/jwt';

function sha256(input: string) {
  return crypto.createHash('sha256').update(input).digest('hex'); // ✅ fixed
}

function daysFromNow(days: number) {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
}

@Injectable()
export class AuthService {
  constructor(
    private readonly db: DbService,
    private readonly jwt: JwtService,
  ) { }

  async register(email: string, password: string) {
    const existing = await this.db.query(
      'SELECT id, email FROM "users" WHERE email = $1 LIMIT 1',
      [email],
    );

    if (existing.rowCount && existing.rows[0]) {
      throw new ConflictException('User already exists');
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const created = await this.db.query(
      `INSERT INTO "users"(email, password_hash)
       VALUES ($1, $2)
       RETURNING id, email, created_at`,
      [email, passwordHash],
    );

    return created.rows[0];
  }

  // private async issueTokens(user: { id: string; email: string }) {
  //   const accessToken = await this.jwt.signAsync(
  //     { sub: user.id, email: user.email },
  //     {
  //       secret: process.env.JWT_SECRET,
  //       expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN ?? '15m',
  //     },
  //   );

  //   const refreshJti = crypto.randomUUID();
  //   const refreshDays = Number(process.env.REFRESH_TOKEN_EXPIRES_DAYS ?? 7);

  //   const refreshToken = await this.jwt.signAsync(
  //     { sub: user.id, jti: refreshJti },
  //     {
  //       secret: process.env.REFRESH_TOKEN_SECRET,
  //       expiresIn: `${refreshDays}d`,
  //     },
  //   );

  //   // store hashed refresh token (rotation-ready)
  //   const tokenHash = sha256(refreshToken);
  //   const expiresAt = daysFromNow(refreshDays);

  //   await this.db.query(
  //     `INSERT INTO "refresh_tokens"(user_id, token_hash, expires_at)
  //      VALUES ($1::uuid, $2, $3)`,
  //     [user.id, tokenHash, expiresAt],
  //   );

  //   return { accessToken, refreshToken };
  // }

  private async issueTokens(user: { id: string; email: string }) {
    const accessToken = await this.jwt.signAsync(
      { sub: user.id, email: user.email },
      {
        secret: process.env.JWT_SECRET,
        expiresIn: (process.env.ACCESS_TOKEN_EXPIRES_IN ?? '1m') as any,
      },
    );

    const refreshJti = crypto.randomUUID();
    const refreshDays = Number(process.env.REFRESH_TOKEN_EXPIRES_DAYS ?? 7);

    const refreshToken = await this.jwt.signAsync(
      { sub: user.id, jti: refreshJti },
      {
        secret: process.env.REFRESH_TOKEN_SECRET,
        expiresIn: `${refreshDays}d` as any,
      },
    );

    const tokenHash = sha256(refreshToken);
    const expiresAt = daysFromNow(refreshDays);

    await this.db.query(
      `INSERT INTO "refresh_tokens"(user_id, token_hash, expires_at)
     VALUES ($1::uuid, $2, $3)`,
      [user.id, tokenHash, expiresAt],
    );

    return { accessToken, refreshToken };
  }

  async login(email: string, password: string) {
    const result = await this.db.query(
      'SELECT id, email, password_hash FROM "users" WHERE email = $1 LIMIT 1',
      [email],
    );

    const user = result.rows[0];
    if (!user) throw new UnauthorizedException('Invalid Credentials');

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) throw new UnauthorizedException('Invalid Credentials');

    return this.issueTokens({ id: user.id, email: user.email });
  }

  async refresh(refreshToken: string) {
    if (!refreshToken) throw new UnauthorizedException('Missing refresh token');

    // 1) verify refresh token signature
    let payload: any;
    try {
      payload = await this.jwt.verifyAsync(refreshToken, {
        secret: process.env.REFRESH_TOKEN_SECRET,
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    // 2) check token exists in DB and not revoked/expired
    const tokenHash = sha256(refreshToken);
    const row = await this.db.query(
      `SELECT id, user_id, expires_at, revoked_at
       FROM "refresh_tokens"
       WHERE token_hash = $1
       LIMIT 1`,
      [tokenHash],
    );

    const saved = row.rows[0];
    if (!saved) throw new UnauthorizedException('Refresh token not recognized');
    if (saved.revoked_at) throw new UnauthorizedException('Refresh token revoked');
    if (new Date(saved.expires_at).getTime() <= Date.now()) {
      throw new UnauthorizedException('Refresh token expired');
    }

    // 3) revoke old token (rotation)
    await this.db.query(
      `UPDATE "refresh_tokens"
       SET revoked_at = now()
       WHERE id = $1`,
      [saved.id],
    );

    // 4) load user email for access token payload
    const userRes = await this.db.query(
      `SELECT id, email FROM "users" WHERE id = $1::uuid LIMIT 1`,
      [saved.user_id],
    );
    const user = userRes.rows[0];
    if (!user) throw new UnauthorizedException('User not found');

    // 5) issue new pair
    return this.issueTokens({ id: user.id, email: user.email });
  }

  async logout(refreshToken: string) {
    if (!refreshToken) throw new UnauthorizedException('Missing refresh token');

    const tokenHash = sha256(refreshToken);
    await this.db.query(
      `UPDATE "refresh_tokens"
       SET revoked_at = now()
       WHERE token_hash = $1 AND revoked_at IS NULL`,
      [tokenHash],
    );

    return { message: 'Logged out' };
  }

}