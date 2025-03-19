export class Order {
    id: number;
    customerName: string;
    orderDate: Date;
    status: string;
    totalAmount: number;

    constructor(id: number, customerName: string, orderDate: Date, status: string, totalAmount: number) {
        this.id = id;
        this.customerName = customerName;
        this.orderDate = orderDate;
        this.status = status;
        this.totalAmount = totalAmount;
    }
}
