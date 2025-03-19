import { Controller, NotImplementedException, ParseUUIDPipe } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { OrdersService } from './orders.service';
import { OrderPaginationDto } from 'src/common/dto';
import { ChangeOrderStatusDto, CreateOrderDto } from './dto';

@Controller()
export class OrdersController {
    constructor(private readonly ordersService: OrdersService) { }

    @MessagePattern('createOrder')
    create(@Payload() createOrderDto: CreateOrderDto) {

        try {
            return this.ordersService.create(createOrderDto);

        } catch (error) {
            throw new NotImplementedException(`Error creating products: ${error.message}`);
        }
    }

    @MessagePattern('findAllOrders')
    findAll(@Payload() orderPaginationDto: OrderPaginationDto) {
        return this.ordersService.findAll(orderPaginationDto);
    }

    @MessagePattern('findOneOrder')
    findOne(@Payload('id', ParseUUIDPipe) id: string,) {

        try {
            return this.ordersService.findOne(id);
        } catch (error) {
            throw new NotImplementedException(`Error finding order: ${error.message}`);
        }

    }

    @MessagePattern('changeOrderStatus')
    changeOrdersStatus(@Payload() changeOrderStatusDto: ChangeOrderStatusDto) {
        try {
            return this.ordersService.changeOrderStatus(changeOrderStatusDto);
        } catch (error) {
            throw new NotImplementedException(`Error changing order status: ${error.message}`);
        }

    }
}
