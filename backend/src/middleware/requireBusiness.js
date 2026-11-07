import { prisma } from '../config/prisma.js';
import { HttpError } from '../utils/httpError.js';
export async function requireBusiness(req,res,next){try{const business=await prisma.business.findFirst({where:{OR:[{ownerId:req.user.id},{members:{some:{userId:req.user.id,active:true}}}]}});if(!business)throw new HttpError(409,'Primero debes configurar tu negocio.','BUSINESS_SETUP_REQUIRED');req.business=business;next();}catch(error){next(error);}}
