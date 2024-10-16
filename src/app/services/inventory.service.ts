import logger from "../../configs/winston.config"
import { getModelForClass } from "@typegoose/typegoose"
import Inventory from "../models/inventory.model"
import User from "../models/user.model"
import ClaimedPainting from "../models/claimedPainting.model"
//import {client} from "../../configs/redis"

const InventoryModel = getModelForClass(Inventory)
const UserModel = getModelForClass(User)

class InventoryService {
    async createInventory(userId: string){
        try{
            // Check if the User has an Inventory already
            const user = await UserModel.findOne({userId}) as User
            if(user?.inventory){
                logger.error('Inventory already exists', {service: 'InventoryService.createInventory'})
                return {
                    success: false,
                    code: 409,
                    message: 'Inventory already exists'
                }
            }

            // Create a new Inventory
            const newInventory = await new InventoryModel().save()

            // Update the User's Inventory
            if(user){
                user.inventory = newInventory._id
                user.save()
            } else {
                logger.error('User not found', {service: 'InventoryService.createInventory'})
                return {
                    success: false,
                    code: 404,
                    message: 'User not found'
                }  
            }

            return {
                success: true,
                code: 201,
            }
        } catch(error){
            logger.error("An error happened: " + error, {service: 'InventoryService.createInventory'})
            return {
                success: false,
                code: 500,
                message: 'An error happened'
            }
        }
    }

    async addPainting(claimedPainting: ClaimedPainting, userId: string){
        try{
            // Check if the CLaimedPainting data is valid
            if(!claimedPainting) {
                logger.error('Invalid ClaimedPainting data', {service: 'InventoryService.addPainting'})
                return {
                    success: false,
                    code: 400,
                    message: 'Invalid ClaimedPainting data'
                }
            }

            /*
            // Check if the Inventory is already in the Redis cache
            const cacheKey = "inventory:" + userId
            const cachedInventory = await client.get(cacheKey)
            if(Object.keys(cachedInventory).length > 0){
                // Add the painting to the cached inventory
                cachedInventory[claimedPainting.id] = JSON.stringify(claimedPainting);
                await redis.hmset(cacheKey, cachedInventory);
                logger.info('Painting added to cached inventory', { service: 'InventoryService.addPainting' });
                return {
                    success: true,
                    code: 200,
                    message: 'Painting added to cached inventory',
                    data: cachedInventory
                };
            }

            */


            // Check if the Inventory exists
            const user = await UserModel.findOne({userId}) as User
            if(!user?.inventory){
                logger.error('Inventory not found', {service: 'InventoryService.addPainting'})
                return {
                    success: false,
                    code: 404,
                    message: 'Inventory not found'
                }
            }

        } catch(error){
            logger.error("An error happened: " + error, {service: 'InventoryService.addPainting'})
            return {
                success: false,
                code: 500,
                message: 'An error happened'
            }
        }
    }
}