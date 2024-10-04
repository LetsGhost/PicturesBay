import { prop } from "@typegoose/typegoose"
import { Document, Types } from "mongoose"

import ClaimedPainting from "./claimedPainting.model"

class Inventory extends Document {

    constructor(claimedPaintings: ClaimedPainting[], createdAt: Date, _id: Types.ObjectId) {
        super();
        this.claimedPaintings = claimedPaintings;
        this.createdAt = createdAt
        this._id = _id
    }
    
    @prop({ required: true })
    public claimedPaintings: ClaimedPainting[];

    @prop({ required: true, default: Date.now })
    public createdAt: Date;

    public _id: Types.ObjectId
}

export default Inventory;