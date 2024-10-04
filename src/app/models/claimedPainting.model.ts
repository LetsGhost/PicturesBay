import { prop, Ref } from "@typegoose/typegoose"
import { Document } from "mongoose"

import Painting from "./painting.model"

class ClaimedPainting extends Document {
    constructor(painting: Ref<Painting>, condition: number, level: string, paintingImagePath: string, name: string, claimedAt: Date, paintingCreatedAt: Date) {
        super();
        this.painting = painting;
        this.condition = condition;
        this.level = level;
        this.paintingImagePath = paintingImagePath;
        this.name = name;
        this.claimedAt = claimedAt;
        this.paintingCreatedAt = paintingCreatedAt;
    }

    @prop({ ref: () => Painting })
    public painting: Ref<Painting>;

    @prop({ required: true })
    public condition: number;
    
    @prop({ required: true })
    public level: string;

    @prop({ required: true })
    public paintingImagePath: string
    
    @prop({ required: true })
    public name: string;

    @prop({ required: true, default: Date.now })
    public claimedAt: Date;

    @prop({ required: true })
    public paintingCreatedAt: Date;
}

export default ClaimedPainting;