import { HttpStatus, Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { PrismaClient } from '@prisma/client';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { OrderPaginationDto, PaginationDto } from 'src/common/dto';
import { ChangeOrderStatusDto } from './dto';
import { PRODUCT_SERVICE } from 'src/config';
import { catchError, firstValueFrom } from 'rxjs';

@Injectable()
export class OrdersService extends PrismaClient implements OnModuleInit {

    constructor(
        @Inject(PRODUCT_SERVICE) private readonly productsClient: ClientProxy
    ) {
        super();
    }


    async onModuleInit() {
        await this.$connect();
    }
    async create(createOrderDto: CreateOrderDto) {

        try {
            const productsId = createOrderDto.items.map(item => item.productId);

            const products: any[] = await firstValueFrom(
                this.productsClient.send({ cmd: 'validate_product' }, { productsId } as any)
            )

            //return products;

            const totalAmount = createOrderDto.items.reduce((acc, orderItem) => {
                //const product = products.find(product => product.id === orderItem.productId).price;
                const product = products.find(product => product.id === orderItem.productId);

                return acc + (product.price * orderItem.quantity);
            }, 0)

            //return { products, totalAmount }

            const totalItems = createOrderDto.items.reduce((acc, orderItem) => {
                return acc + orderItem.quantity;
            }, 0)

            const order = await this.order.create({
                data: {
                    totalAmount: totalAmount,
                    totalItems: totalItems,
                    OrderItem: {
                        createMany: {
                            data: createOrderDto.items.map(orderItem => ({
                                price: products.find(product => product.id === orderItem.productId).price,
                                productId: orderItem.productId,
                                quantity: orderItem.quantity
                            }))
                        }
                    }
                },
                include: {
                    OrderItem: {
                        select: {
                            productId: true,
                            price: true,
                            quantity: true
                        }
                    }
                }
            })

            //return order;
            return {
                ...order,
                OrderItem: order.OrderItem.map(orderItem => ({
                    ...orderItem,
                    product: products.find(product => product.id === orderItem.productId).name,
                    createdAt: products.find(product => product.id === orderItem.productId).createdAt,
                }))
            };

        } catch (error) {
            throw new RpcException({
                message: error.message,
                status: HttpStatus.INTERNAL_SERVER_ERROR
            })
        }
    }

    async findAll(orderPaginationDto: OrderPaginationDto) {

        const page = orderPaginationDto.page ?? 1;
        const limit = orderPaginationDto.limit ?? 10;

        const totalPages = await this.order.count({ where: { status: orderPaginationDto.status } })
        const lastPage = Math.ceil(totalPages / limit);

        return {
            data: await this.order.findMany({
                skip: (page - 1) * limit,
                take: limit,
                where: { status: orderPaginationDto.status }
            }),
            meta: {
                page: page,
                total: totalPages,
                lastPage: lastPage
            }
        }
    }

    async findOne(id: string) {

        const order = await this.order.findFirst({
            where: {
                id: id
            },
            include: {
                OrderItem: {
                    select: {
                        productId: true,
                        price: true,
                        quantity: true
                    }
                }
            },
        });

        if (!order) {
            throw new RpcException({
                message: `Order with id ${id} not found`,
                status: HttpStatus.NOT_FOUND
            })
        }

        const productsId = order.OrderItem.map(orderItem => orderItem.productId)



        const products: any[] = await firstValueFrom(
            this.productsClient.send({ cmd: 'validate_product' }, { productsId } as any)
        )


        //return products;
        return {
            ...order,
            OrderItem: order.OrderItem.map(orderItem => ({
                ...orderItem,
                product: products.find(product => product.id === orderItem.productId).name,
            }))
        };

    }

    async changeOrderStatus(changeOrderStatus: ChangeOrderStatusDto) {

        const { id, status } = changeOrderStatus;

        const order = await this.order.findUnique({
            where: {
                id: id
            }
        });

        if (!order) {
            throw new RpcException({
                message: `Order with id ${id} not found`,
                status: HttpStatus.NOT_FOUND
            })
        }

        if (order.status === status) {
            return order;
        }

        return this.order.update({
            where: { id: changeOrderStatus.id },
            data: { status: changeOrderStatus.status }
        })
    }



}
