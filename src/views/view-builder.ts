import { IOrderEntity } from "../entities/interfaces";
import { OrderStatusUtil } from "../entities/utils";

export interface IViewBuilder<E> {
    buildView(entity: E) : Record<string,any>;
}

function _priceForDisplay(priceString: bigint) {
    return `${priceString}`;
}

export class OrderViewBuilder implements IViewBuilder<IOrderEntity> {
    buildView(entity: IOrderEntity): Record<string, any> {
        return {
            id : entity.id,
            creationDate : entity.creationDate.toString(),
            name : entity.name,
            description : entity.description,
            status : OrderStatusUtil.toString(entity.status),
            salePrice : (entity.salePrice) ?_priceForDisplay(entity.salePrice) : null,
            dueDate : (entity.dueDate) ? entity.dueDate.toString() : null,
            creator: (entity.creator)
        };
    }
}