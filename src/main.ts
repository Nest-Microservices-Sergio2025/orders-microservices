import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { envs } from './config';
import { Logger, ValidationPipe } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {

    const logger = new Logger("Orders Microservice")

    const app = await NestFactory.createMicroservice<MicroserviceOptions>(
        AppModule,
        {
            transport: Transport.NATS,
            options: {
                //port: envs.PORT
                servers: envs.NATS_SERVERS,
            }
        }
    );

    app.useGlobalPipes(
        new ValidationPipe({
            transform: true,  // Convierte automáticamente los tipos
            whitelist: true,  // Elimina propiedades no definidas en los DTO
            forbidNonWhitelisted: true, // Lanza error si hay propiedades desconocidas
            transformOptions: {
                enableImplicitConversion: true,  // Convierte sin necesidad de `@Type`
            },
        }),
    );

    await app.listen();


    logger.log(`products microservices running on http://localhost:${envs.PORT}`);

}
bootstrap();
