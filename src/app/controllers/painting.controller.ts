import PaintingService from "../services/painting.service";
import logger from "../../configs/winston.config";
import { Request, Response } from "express";

class PaintingController{
    async createPainting(req: Request, res: Response){
        try{
            const paintingData = req.body;
            const response = await PaintingService.createPainting(paintingData);
            if(response.success){
                logger.info('Paintings created successfully', {service: 'PaintingController.createPainting'});
                return res.status(response.code).send(response);
            }

            logger.error('Error creating painting:', response.message, {service: 'PaintingController.createPainting'});
            return res.status(response.code).send(response);
        } catch(err){
            logger.error('Error creating painting:', err, {service: 'PaintingController.createPainting'});
            return res.status(500).send({
                success: false,
                code: 500,
                message: 'Internal server error'
            });
        }
    }
}

export default new PaintingController();