import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
// import { MyLogger } from './logger.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // const myLoggerInstance = app.get(MyLogger);

  // app.useLogger(myLoggerInstance);

  const dbType = (configService.get<string>('DB_TYPE', 'sqlite') ?? 'sqlite').toLowerCase();
  const hasDatabaseUrl = !!configService.get<string>('DATABASE_URL');
  const effectiveDb = dbType === 'postgres' || hasDatabaseUrl ? 'postgres' : 'sqlite';
  const rawFrontendUrl = configService.get<string>('FRONTEND_URL');

  // eslint-disable-next-line no-console
  console.log(
    `[BOOT] DB=${effectiveDb} (DB_TYPE=${dbType}, DATABASE_URL=${hasDatabaseUrl ? 'set' : 'not set'})`,
  );
  // eslint-disable-next-line no-console
  console.log(
    `[BOOT] CORS FRONTEND_URL=${rawFrontendUrl ? rawFrontendUrl : 'not set (allow all origins)'}`,
  );

  const frontendUrls = rawFrontendUrl
    ? rawFrontendUrl.split(',').map((url) => url.trim())
    : true;

  app.enableCors({
    origin: frontendUrls,
    credentials: true,
  });

  const config = new DocumentBuilder()
    .setTitle('Ejemplo de API')
    .setDescription('Documentación generada automáticamente con Swagger')
    .setVersion('1.0')
    .build();

  if (process.env.ENABLE_SWAGGER !== 'false') {
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);
  }

  const port = Number(process.env.PORT) || 3000;
  await app.listen(port, '0.0.0.0');
}
bootstrap();
