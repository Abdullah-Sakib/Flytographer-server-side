const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;
require('dotenv').config()

app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.3booq2e.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run(){
  try{
    const serviceCollection = client.db("flytographerDB").collection("services");
    
    app.post('/service', async(req, res) =>{
      const service = req.body;
      const result = await serviceCollection.insertOne(service);
      res.send(result);
    })

    app.get('/services', async(req, res) => {
      const dataLimit = parseInt(req.query.dataLimit);
      const query = {};
      const cursor = serviceCollection.find(query);
      if(dataLimit){
       const result = await cursor.limit(dataLimit).toArray();
       return res.send(result);
      }
      const result = await cursor.toArray();
      res.send(result);
    })

    app.get('/service/:id', async(req, res) => {
      const id = req.params.id;
      const query = {_id : ObjectId(id)};
      const result = await serviceCollection.findOne(query);
      res.send(result)
    })

  }
  finally{

  }
}

run().catch(error => console.log(error))


app.get('/', (req, res)=>{
  res.send('flytographer server is running')
})

app.listen(port, () => {
  console.log(`flytographer server is running on port ${port}`)
})