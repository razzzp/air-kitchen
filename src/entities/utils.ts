import { EOrderStatus, EUserStatus } from "./interfaces";

export class OrderStatusUtil {
    public static toString(orderStatus : EOrderStatus) : string {
        switch(orderStatus) {
            case EOrderStatus.Done:
                return 'Done';
            case EOrderStatus.Pending:
                return 'Pending';
            case EOrderStatus.Cancelled:
                return 'Cancelled';
            case EOrderStatus.InProgress:
                return 'In Progress';
            case EOrderStatus.OnHold:
                return 'On Hold';
            default:
                return 'Unknown';
        }
    }

    public parse(str : string) : EOrderStatus | undefined {
        switch(str) {
            case 'Done':
                return EOrderStatus.Done;
            case 'Pending':
                return EOrderStatus.Pending;
            case 'Cancelled':
                return EOrderStatus.Cancelled;
            case 'In Progress':
                return EOrderStatus.InProgress;
            case 'On Hold':
                return EOrderStatus.OnHold;
            default:
                return undefined;
        }
    }
}

export class UserStatusUtil{
    public static toString(userStatus : EUserStatus) : string {
        switch(userStatus) {
            case EUserStatus.Active:
                return 'Active';
            case EUserStatus.Inactive:
                return 'Inactive';
            default:
                return 'Unknown';
        }
    }

    public parse(str : string) : EUserStatus | undefined {
        switch(str) {
            case 'Active':
                return EUserStatus.Active;
            case 'Inactive':
                return  EUserStatus.Inactive;
            default:
                return undefined;
        }
    }
}