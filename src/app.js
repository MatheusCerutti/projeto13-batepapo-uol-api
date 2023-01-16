import express from 'express'
import cors from 'cors'
import { MongoClient, ObjectId } from "mongodb";
import dotenv from "dotenv";
import joi from 'joi';

const server = express()
server.use(express.json())
server.use(cors())

dotenv.config()


const mongoClient = new MongoClient(process.env.DATABASE_URL);
let db;

mongoClient.connect().then(() => {
    db = mongoClient.db("nomeDoBancoDeDados");
});


server.listen(5001, () => {
    console.log('Servidor funfou')
})

try {
    server.post("/participants", (req, res) => {

        const infos = req.body

        const validainfos = joi.object({
            name: joi.string().required()
        })

        const validacao = validainfos.validate(infos.name, { abortEarly: true });

        if (validacao.error) {
            return res.status(422).send(validacao.error.details)
        }

    })

    //vai vir o name, {name : joao}

} catch (error) {
    console.log(error)
    res.status(500).send("Erro no servidor");
}







