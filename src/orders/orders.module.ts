import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { envs, PRODUCT_SERVICE } from 'src/config';
import { NatsModule } from 'src/transports/nats.module';

@Module({
    controllers: [OrdersController],
    providers: [OrdersService],
    imports: [
        /* ClientsModule.register([
            {
                name: PRODUCT_SERVICE,
                transport: Transport.TCP,
                options: {
                    host: envs.PRODUCTS_MICROSERVICE_HOST,
                    port: envs.PRODUCTS_MICROSERVICE_PORT
                }
            },
        ]), */
        NatsModule
    ]
})
export class OrdersModule { }
