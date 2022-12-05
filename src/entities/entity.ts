export class Entity {
    private _id: number;
    public set id(value: number) {
        this._id = value;
    }
    public get id(): number {
        return this._id;
    }

    private _creationDate: number;
    public get creationDate(): number {
        return this._creationDate;
    }

    /**
     *
     */
    constructor() {
        this._id = null;
        this._creationDate = Date.now()
    }
}