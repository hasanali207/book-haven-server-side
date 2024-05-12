const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser')
require('dotenv').config();

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.wdiwjgo.mongodb.net`;

const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());
app.use(cookieParser())
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "https://cardoctor-bd.web.app",
      "https://cardoctor-bd.firebaseapp.com",
    ],
    credentials: true,
  })
);

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    await client.connect();
    const database = client.db("bookItem");
    const itemCollection = database.collection("Items");

    // JWT implementation
   //creating Token
   app.post("/jwt",  async (req, res) => {
    const user = req.body;
    console.log("user for token", user);
    const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET);
  
    res.cookie('token', token, {
      httpOnly:true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production'?'none':'strict' 
    })
    .send({success:true})
  });

  app.get("/logout", async (req, res) => {
       
      res.clearCookie("token", {
      httpOnly:true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production'?'none':'strict' ,
       maxAge: 0 })
      .send({ success: true });
  });

    app.post('/items', async (req, res) => {
      
        const newItem = req.body;
        const result = await itemCollection.insertOne(newItem);
        res.send(result);
    }
    );

    app.get('/items', async (req, res) => {
     
        const cursor = itemCollection.find();
        const result = await cursor.toArray();
        res.send(result);
      
    });


    app.get('/items/:id', async(req, res)=>{
      const id = req.params.id
      const query = {_id : new ObjectId(id)}
      const result = await itemCollection.findOne(query)
      res.send(result)
    })

    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // await client.close();
  }
}

run().catch(console.dir);

app.get('/', async (req, res) => {
  res.send('Start Book Haven Server');
});

app.listen(port, () => {
  console.log(`Server Running ${port}`);
});
