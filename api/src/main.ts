import { NestFactory } from '@nestjs/core';

import { CrudConfigService } from '@dataui/crud';
//Befor import app module
CrudConfigService.load({
  params: {
    id: {
      field: 'id',
      type: 'uuid',
      primary: true,
    },
  },
});

import { AppModule } from './app.module';
import { VersioningType } from '@nestjs/common';
import * as firebase from 'firebase-admin';
import * as path from 'path';
import "./instrument";

firebase.initializeApp({
  credential: firebase.credential.cert(
    path.join(__dirname, '../firebase.json'),
  ),
});
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.enableVersioning({
    type: VersioningType.URI,
  });
  // app.useGlobalPipes(
  //   new ValidationPipe({
  //     transform: true,
  //     transformOptions: { enableImplicitConversion: true },
  //     whitelist: true,
  //   }),
  // );
  const port = process.env.PORT || 3000;

  await app.listen(port);
}
bootstrap();
