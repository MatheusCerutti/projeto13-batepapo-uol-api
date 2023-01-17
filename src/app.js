import express, { application } from 'express'
import cors from 'cors'
import { MongoClient, ObjectId } from "mongodb";
import dotenv from "dotenv";
import joi from 'joi';
import dayjs from 'dayjs';

const server = express()
server.use(express.json())
server.use(cors())

dotenv.config()


const mongoClient = new MongoClient(process.env.DATABASE_URL);
let db;

try {
    await mongoClient.connect()
    db = mongoClient.db()

} catch (error) {
    console.error(error)
    console.log("Erro ao conectar no banco de dados")

}




server.listen(5001, () => {
    console.log('Servidor funfou')
})

try {
    server.post("/participants", async (req, res) => {

        const { name } = req.body

        const validainfos = joi.object({
            name: joi.string().required()
        })

        const validacao = validainfos.validate({ name });

        if (validacao.error) {
            return res.status(422).send(validacao)
        }

        try {
            const checarnome = await db.collection("participants").findOne({ name })

            if (checarnome) {
                return res.status(409).send("Nome já existe")
            }

            await db.collection("participants").insertOne({ name, lastStatus: Date.now() })
            await db.collection("messages").insertOne({ from: { name }, to: "Todos", text: "entra na sala...", type: "status", time: dayjs(Date.now()).format("HH:mm:ss") })
            res.status(201).send("Deu certo")

        } catch (error) {
            res.status(500).send("Erro no servidor")
        }

    })
} catch (error) {
    console.log(error)
    res.status(500).send("Erro no servidor");
}

server.get("/participants", async (req, res) => {
    try {

        const listaparticipantes = await db.collection("participants").find().toArray()
        res.send(listaparticipantes)

    } catch (error) {
        console.error(error)
        res.status(500).send("Erro no servidor")

    }
})







