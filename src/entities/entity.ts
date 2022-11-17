export class Entity {
    _id: string | null;
    _creationDate: number;
    /**
     *
     */
    constructor(id: string) {
        this._id = id;
        this._creationDate = Date.now()
    }
}