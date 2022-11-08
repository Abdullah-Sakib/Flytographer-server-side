const express = require('express');
const { MongoClient, ServerApiVersion } = require('mongodb');
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