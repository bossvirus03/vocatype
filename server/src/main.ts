import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Bật CORS cho phép frontend kết nối
  app.enableCors();
  
  // Thêm tiền tố api cho tất cả các Rest API endpoints
  app.setGlobalPrefix('api');

  const port = process.env.PORT || 5001;
  await app.listen(port);
  console.log(`VocaType NestJS API Server is running on: http://localhost:${port}/api`);
}
bootstrap();
