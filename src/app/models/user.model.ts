import { prop } from '@typegoose/typegoose';

class User {
    @prop({required: true})
    public email?: string;

    @prop({required: true})
    public password?: string;

    @prop({required: true, default: Date.now})
    public createdAt?: Date;
}

export default User;