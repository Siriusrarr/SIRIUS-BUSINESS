import { prisma } from '../config/prisma.js';
import { inputs, solve } from '../services/priceStudy.js';
import { HttpError } from '../utils/httpError.js';

export async function calculate(req,res) {
  const parsed=inputs.safeParse(req.body);
  if (!parsed.success) throw new HttpError(400,'Revisa las cantidades, la precisión y el máximo de pasos.','INVALID_INPUT');
  const d=parsed.data;
  const methods=d.mode==='both'?['bis','newton']:[d.mode];
  const results=methods.map(method=>({method,output:solve(d,method)}));
  if (results.every(r=>r.output.status==='error')) throw new HttpError(400,results.map(r=>r.output.message).join(' '),'INVALID_START');
  const study=await prisma.priceStudy.create({data:{businessId:req.business.id,inputs:d,results:{create:results}},include:{results:true}});
  res.status(201).json(study);
}
export async function history(req,res) {
  res.json(await prisma.priceStudy.findMany({where:{businessId:req.business.id},orderBy:{createdAt:'desc'},take:30,select:{id:true,createdAt:true,inputs:true}}));
}
export async function detail(req,res) {
  const study=await prisma.priceStudy.findFirst({where:{businessId:req.business.id,id:req.params.id},include:{results:true}});
  if (!study) throw new HttpError(404,'Cálculo no encontrado.','NOT_FOUND');
  res.json(study);
}
