
import { Column, Entity, ManyToOne } from "typeorm";
import { EOrderStatus, IOrder } from "../interfaces";
import { RootEntity } from "./root-entity";
import { User } from "./user";



@Entity()
export class Order extends RootEntity implements IOrder{

    /**
     *  initialization constructor, assumes the data is safe
     */
    constructor(data?: IOrder) {
        super();
        if (!data) return;

        this.name= data.name;
        this.description= data.description;
        this.status= data.status;
        this.dueDate= data.dueDate;
        this.salePrice= data.salePrice;
    }
    
    @Column({
        type : "varchar",
        length : 255,
        default:""
    })
    public name: string;

    @Column({
        type : "varchar",
        length : 1000,
        default: "",
    })
    public description : string;

    @Column({
        type : "enum",
        enum : EOrderStatus,
        default : EOrderStatus.Pending
    })
    public status : EOrderStatus;

    @Column({
        type: "datetime",
        default: null,
    })
    public dueDate : Date;

    // stored as int to avoid rounding errors
    @Column({
        type : 'bigint',
        default: 0,
    })
    public salePrice: bigint;

    @ManyToOne(
        ()=>User)
    public creator: User;
   
}
