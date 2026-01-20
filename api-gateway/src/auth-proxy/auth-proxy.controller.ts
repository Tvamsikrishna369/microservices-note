import { Body, Controller, Get, HttpException, Post } from '@nestjs/common';
import axios from 'axios';
import { Headers } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Controller('api/auth')
export class AuthProxyController {
  private readonly authBaseUrl: string

  constructor(private readonly config: ConfigService) {
    this.authBaseUrl = this.config.get<string>('AUTH_SERVICE_URL')!;
  }

  @Get('health')
  async health() {
    const response = await axios.get(`${this.authBaseUrl}`);
    return response.data;
  }

  @Get('me')
  async me(@Headers('authorization') authorization?: string) {
    try {
      const response = await axios.get(`${this.authBaseUrl}/auth/me`, {
        headers: { Authorization: authorization ?? " " },
      })
      return response.data;
    } catch (err: any) {
      const status = err?.response?.status ?? 500;
      const data = err?.response?.data ?? { message: 'GateWay Error' };
      throw new HttpException(data, status);
    }
  }


  @Post("register")
  async register(@Body() body: any) {
    try {
      const resposne = await axios.post(`${this.authBaseUrl}/auth/register`, body, {
        headers: { 'Content-type': 'application/json' },
      });
      return resposne.data;
    } catch (err: any) {
      const status = err?.response?.status ?? 500;
      const data = err?.response?.data ?? { message: "Gateway error" };
      throw new HttpException(data, status);
    }
  }

  @Post('login')
  async login(@Body() body: any) {
    try {
      const response = await axios.post(`${this.authBaseUrl}/auth/login`, body, {
        headers: { 'Content-Type': 'application/json' }
      });
      return response.data;
    } catch (err: any) {
      const status = err?.response?.status ?? 500;
      const data = err?.response?.data ?? { message: "Gateway error" };
      throw new HttpException(data, status);
    }
  }

  @Post('refresh')
  async refresh(@Body() body: any) {
    if (!body?.refreshToken) {
      throw new HttpException({ message: 'refreshtoken is required' }, 400);
    }
    try {
      const response = await axios.post(`${this.authBaseUrl}/auth/refresh`, body, {
        headers: { 'Content-Type': 'application/json' },
      })
      return response.data;
    } catch (err: any) {
      const data = err?.response?.data ?? { message: 'Gateway error' };
      const statusCode = Number(err?.response?.status) || Number(data?.statusCode) || 500;
      throw new HttpException(data, statusCode);
    }
  }

  @Post('logout')
  async logout(@Body() body: any) {
    if (!body?.refreshToken) {
      throw new HttpException({ message: 'refreshtoken is required' }, 400);
    }
    try {
      const response = await axios.post(`${this.authBaseUrl}/auth/logout`, body, {
        headers: { 'Content-Type': 'application/json' }
      })
      return response.data;
    } catch (err: any) {
      const data = err?.response?.data ?? { message: 'Gateway error' };
      const statusCode = Number(err?.response?.status) || Number(data?.statusCode) || 500;
      throw new HttpException(data, statusCode);
    }
  }

}
