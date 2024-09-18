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
            
            // Generating the condition randomly 
            //const condition = Math.floor(Math.random() * 100) + 1;

            // Loop through levels and create paintings
            for (const level of levels) {
                const newPainting = new PaintingModel({
                    ...paintingData,
                    level,
                    number,
                    condition: 100
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

    async getPaintingById(paintingId: string){
        try{
            // Ensure paintingId is defined
            if(!paintingId){
                logger.error('Painting ID is required', {service: 'PaintingService.getPaintingById'});
                return {
                    success: false,
                    code: 400,
                    message: 'Painting ID is required'
                }
            }

            // Check if painting exists
            const painting = await PaintingModel.findById(paintingId);
            if(!painting){
                logger.error('Painting not found', {service: 'PaintingService.getPaintingById'});
                return {
                    success: false,
                    code: 404,
                    message: 'Painting not found'
                }
            }

            return {
                success: true,
                code: 200,
                painting: painting
            };
        } catch(err){
            logger.error('Error getting painting by id:', err, {service: 'PaintingService.getPaintingById'});
            return {
                success: false,
                code: 500,
                message: 'Internal server error'
            }
        }
    }

    async getPaintingWithLevel(level: string) {
        try {    
            // Ensure level is defined
            if (!level) {
                logger.error('Level is required', {service: 'PaintingService.getPaintingWithLevel'});
                return {
                    success: false,
                    code: 400,
                    message: 'Level is required'
                };
            }
    
            // Check if level is valid
            const levels = ['common', 'rare', 'epic', 'legendary'];
            if (!levels.includes(level)) {
                logger.error('Invalid level', {service: 'PaintingService.getPaintingWithLevel'});
                return {
                    success: false,
                    code: 400,
                    message: 'Invalid level'
                };
            }
    
            // Get 5 random paintings by level
            const paintings = await PaintingModel.aggregate([
                { $match: { level } },
                { $sample: { size: 5 } }
            ]);
            if (!paintings || paintings.length === 0) {
                logger.error('Paintings not found', {service: 'PaintingService.getPaintingWithLevel'});
                return {
                    success: false,
                    code: 404,
                    message: 'Paintings not found'
                };
            }
    
            return {
                success: true,
                code: 200,
                paintings: paintings
            };
        } catch (err) {
            logger.error('Error getting painting by level:', err, {service: 'PaintingService.getPaintingWithLevel'});
            return {
                success: false,
                code: 500,
                message: 'Internal server error'
            };
        }
    }
}

export default new PaintingService();