import express from 'express'; import cors from 'cors'; import { PrismaClient } from '@prisma/client';
const app=express(); const prisma=new PrismaClient();
app.use(cors()); app.use(express.json());

app.get('/api/inventory', async (_req,res)=>res.json(await prisma.inventoryItem.findMany()));
app.post('/api/inventory', async (req,res)=>res.status(201).json(await prisma.inventoryItem.create({ data:req.body })));
app.put('/api/inventory/:id', async (req,res)=>res.json(await prisma.inventoryItem.update({ where:{id:req.params.id}, data:req.body })));

app.get('/api/tasks', async (_req,res)=>res.json(await prisma.task.findMany()));
app.post('/api/tasks', async (req,res)=>res.status(201).json(await prisma.task.create({ data:req.body })));
app.put('/api/tasks/:id', async (req,res)=>res.json(await prisma.task.update({ where:{id:req.params.id}, data:req.body })));

app.listen(4002, ()=>console.log('LIMS API on http://localhost:4002'));
