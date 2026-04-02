import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
// import { MyLogger } from './logger.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // const myLoggerInstance = app.get(MyLogger);

  // app.useLogger(myLoggerInstance);

  const frontendUrls = process.env.FRONTEND_URL
    ? process.env.FRONTEND_URL.split(',').map((url) => url.trim())
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
