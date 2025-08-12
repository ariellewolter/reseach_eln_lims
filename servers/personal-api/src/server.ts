import express from 'express'; import cors from 'cors'; import { PrismaClient } from '@prisma/client';
const app=express(); const prisma=new PrismaClient();
app.use(cors()); app.use(express.json({limit:'2mb'}));

app.get('/api/notes', async (_req,res)=>res.json(await prisma.note.findMany({ orderBy:{updatedAt:'desc'}})));
app.post('/api/notes', async (req,res)=>res.status(201).json(await prisma.note.create({ data:{ title:req.body.title ?? 'Untitled', markdown:req.body.markdown ?? '' } })));
app.put('/api/notes/:id', async (req,res)=>res.json(await prisma.note.update({ where:{id:req.params.id}, data:{ title:req.body.title, markdown:req.body.markdown } })));

app.get('/api/tables', async (_req,res)=>res.json(await prisma.tableDoc.findMany({ orderBy:{updatedAt:'desc'}})));
app.post('/api/tables', async (req,res)=>res.status(201).json(await prisma.tableDoc.create({ data:{ title:req.body.title ?? 'Table', data: JSON.stringify(req.body.data ?? [['','']]) } })));
app.put('/api/tables/:id', async (req,res)=>res.json(await prisma.tableDoc.update({ where:{id:req.params.id}, data:{ title:req.body.title, data: JSON.stringify(req.body.data) } })));

app.listen(4001, ()=>console.log('Personal API on http://localhost:4001'));
