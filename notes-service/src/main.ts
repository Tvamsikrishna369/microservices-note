import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    })
  )

  const port = process.env.PORT ?? 4001;
  await app.listen(port);
  console.log(`Notes Service Running on Port: ${port}`);

  // await app.listen(process.env.PORT ?? 4001);
  // console.log("notes-service Running on Port:", process.env.PORT ?? 4001)
}
bootstrap();
