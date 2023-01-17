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
            res.status(500).send("Erro no bd")
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


server.post("/messages", async (req, res) => {
    const {to,text,type} = req.body
    const {user} = req.headers


    const validamessagem = joi.object({
        from:joi.string().required(),
        to:joi.string().required(),
        text:joi.string().required(),
        type:joi.string().required().valid("message","private_message")
    })

    const validacao = validamessagem.validate({ from: user,to,text,type });

    if (validacao.error) {
        return res.status(422).send(validacao)
    }

    try {
        const validarusuario = await db.collection("participants").findOne({name:user})

        if (!validarusuario){
            return res.status(422).send()
        }
    
        await db.collection("messages").insertOne({from:user,to,text,type,time:dayjs().format("HH:mm:ss")})
    
        res.status(201).send("Deu certo")
        
    } catch (error) {
        res.status(500).send("Deu erro no bd")
    }

   
})

server.get("/messages", async(req, res) =>{
    const {user} = req.headers
    const limite = parseInt(req.query.limit)

    try {

        const messagens = await db.collection("messages").find({
            $or: [
                {from: user},
                {to: {$in: [user,"Todos"]}},
                {type:"message"}
            ]
        }).limit(limite).toArray()

        res.send(messagens)
        
    } catch (error) {
        console.error(error)
        res.status(500).send("Erro no servidor")
    }
})





