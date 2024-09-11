import Painting from '../models/painting.model';
import logger from '../../configs/winston.config';
import mongoose from 'mongoose';
import { getModelForClass } from '@typegoose/typegoose';

const PaintingModel = getModelForClass(Painting);

class PaintingService{
    async createPainting(paintingData: Painting){
        try{
            // Ensure paintingData is defined
            if(!paintingData){
                logger.error('Painting data is required', {service: 'PaintingService.createPainting'});
                return {
                    success: false,
                    code: 400,
                    message: 'Painting data is required'
                }
            }

            // Check if painting already exists
            const paintingExists = await PaintingModel.findOne({name: paintingData.name});
            if(paintingExists){
                logger.error('Painting already exists', {service: 'PaintingService.createPainting'});
                return {
                    success: false,
                    code: 409,
                    message: 'Painting already exists'
                }
            }

            // Create painting
            // Levels array
            const levels = ['common', 'rare', 'epic', 'legendary'];
            const number = 10;

            // Loop through levels and create paintings
            for (const level of levels) {
                const newPainting = new PaintingModel({
                    ...paintingData,
                    level,
                    number
                });
                await newPainting.save();
            }

            return {
                success: true,
                code: 201,
                message: 'Paintings created successfully',
            };
        } catch(err){
            logger.error('Error creating painting:', err, {service: 'PaintingService.createPainting'});
            return {
                success: false,
                code: 500,
                message: 'Internal server error'
            }
        }
    }
}

export default new PaintingService();