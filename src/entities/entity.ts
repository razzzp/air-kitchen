export class Entity {
    private _id: string;
    public get id(): string {
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