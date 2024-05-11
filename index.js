const express = require('express')
const cors = require('cors')

const app = express()
const port = process.env.PORT || 5000


app.use(express.json())
app.use(cors())
require('dotenv').config()


const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.wdiwjgo.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
  
    // await client.connect();
   
    const database = client.db("bookItem");
    const itemCollection = database.collection("Items");

// jwt emplement 

        
    app.post('/items', async(req, res) =>{
        const newItem = req.body
        console.log(newItem)
        const result = await itemCollection.insertOne(newItem)
        res.send(result)
    })
    
    app.get('/items', async(req, res) =>{
        const cursor = itemCollection.find()
        const result = await cursor.toArray()
        res.send(result)
    })


    
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    
    // await client.close();
  }
}
run().catch(console.dir);





app.get('/', async(req, res) =>{
    res.send('Start Book Haven Server')
})

app.listen(port, () =>{
    console.log('Server Running');
    
})