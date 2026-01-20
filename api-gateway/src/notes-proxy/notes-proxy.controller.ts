import { Body, Controller, Get, Headers, HttpException, Post, Query } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Controller('api/notes')
export class NotesProxyController {

  private readonly notesBaseUrl: string;

  constructor(private readonly config: ConfigService) {
    this.notesBaseUrl = this.config.get<string>('NOTES_SERVICE_URL')!;
  }

  @Get("health")
  async health() {
    // const response = await axios.get("http://localhost:4001");
    const response = await axios.get(`${this.notesBaseUrl}`);
    return response.data;
  }

  @Post()
  async create(@Body() body: any, @Headers('authorization') authorization?: string) {
    try {
      const response = await axios.post(`${this.notesBaseUrl}/notes`, body, {
        headers: { Authorization: authorization ?? '' },
      })
      return response.data;
    } catch (err: any) {
      const status = err?.response?.status ?? 500;
      const data = err?.response?.data ?? { message: "Gateway Error" };
      throw new HttpException(data, status);
    }
  }

  @Get()
  async list(
    @Query('userId') userId?: string,
    @Headers('authorization') authorization?: string
  ) {
    try {
      const response = await axios.get(`${this.notesBaseUrl}/notes`, {
        params: { userId },
        headers: { Authorization: authorization ?? '' },
      })
      return response.data;
    } catch (err: any) {
      const status = err?.response?.status ?? 500;
      const data = err?.response?.data ?? { message: "Gateway Error" };
      throw new HttpException(data, status);
    }
  }
}