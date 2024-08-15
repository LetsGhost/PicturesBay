import { prop } from '@typegoose/typegoose';

class User {
    @prop({required: true})
    public email?: string;

    @prop({required: true})
    public password?: string;

    @prop({required: true})
    public createdAt: Date = new Date();
}

export default User;