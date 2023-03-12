import { OrderPostValidator } from "../validators/joi/order-validator";



let validator: OrderPostValidator;

beforeAll(()=>{
    validator = new OrderPostValidator();
});

test('test empty object', ()=>{
    const testInput = {};
    const result = validator.validate(testInput);

    expect(result.error).toBeDefined();
});


test('test full object', ()=>{
    const testInput = {
        name: 'Order',
        description: 'Some desc',
        status: 1,
        dueDate: new Date(),
        salePrice: '1000'
    };
    const result = validator.validate(testInput);

    expect(result.error).toBeUndefined();
    expect(result.warning).toBeUndefined();
    expect(result.value).toMatchObject(testInput);
});

test('test desc missing', ()=>{
    const testInput = {
        name: 'Order',
        status: 1,
        dueDate: new Date(),
        salePrice: '1000'
    };
    const result = validator.validate(testInput);

    expect(result.error).toBeUndefined();
    expect(result.warning).toBeUndefined();
    expect(result.value).toMatchObject(testInput);
});