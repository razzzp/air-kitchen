import { Order } from "../entities/typeorm-entities/order";
import getMySQLDataSource from "../data-sources/typeorm-datasource";
import { IOrderRepository } from "../repositories/interfaces";
import { OrderRepository } from "../repositories/typeorm-repositories/order-repository";

async function buildOrderRepo(dropTable = false) : Promise<OrderRepository> {
    const dataSource = getMySQLDataSource();
    await dataSource.initialize();
    await dataSource.synchronize(dropTable);
    const newOrderRepo =  new OrderRepository(dataSource);
    return newOrderRepo;
}


async function testSave(orderRepo : IOrderRepository) {
    const newOrder = new Order();
    newOrder.name = 'test order 1';
    newOrder.description = 'this is a test description for order 1\n test123';
    newOrder.dueDate = new Date(2023, 1, 1);
    
    const insertedOrder = await orderRepo.save(newOrder);
    console.log(insertedOrder);
}


async function test() {
    const orderRepo = await buildOrderRepo(true);
    await testSave(orderRepo);
    orderRepo.destroy();
}

test()
.then((val) => {
    console.log('done');
})
.catch((val) => {
    console.log('error');
});