import express from 'express'
import cors from 'cors'
import { MongoClient, ObjectId } from "mongodb";
import dotenv from "dotenv";

const server = express()
server.use(express.json())
server.use(cors())

dotenv.config()


const mongoClient = new MongoClient(process.env.DATABASE_URL);
let db;

mongoClient.connect().then(() => {
	db = mongoClient.db("nomeDoBancoDeDados");
});


server.listen(5000, () => {
    console.log('Servidor funfou')
})






