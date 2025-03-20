import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { NAST_SERVICE, envs } from 'src/config';

@Module({

    imports: [
        ClientsModule.register([
            {
                name: NAST_SERVICE,
                transport: Transport.NATS,
                options: {
                    servers: envs.NATS_SERVERS
                }
            },
        ]),
    ],
    exports: [
        ClientsModule.register([
            {
                name: NAST_SERVICE,
                transport: Transport.NATS,
                options: {
                    servers: envs.NATS_SERVERS
                }
            },
        ]),
    ]

})
export class NatsModule { }
