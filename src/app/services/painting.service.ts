import Painting from '../models/painting.model';

class PaintingService{
    async createPainting(paintingData: any){
        try{

        } catch(err){
            console.log(err);
            return {
                success: false,
                code: 500,
                message: 'Internal server error'
            }
        }
    }
}

export default new PaintingService();