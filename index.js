const express = require("express");
const jwt = require("jsonwebtoken");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const cors = require("cors");
const { application } = require("express");
const app = express();
const port = process.env.PORT || 5000;
require("dotenv").config();

app.use(cors());
app.use(express.json());

// Connect MongoDB
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.3booq2e.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

const verifyJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send({ message: "unauthorized access" });
  }
  const token = authHeader.split(" ")[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).send({ message: "unauthorized access" });
    }
    req.decoded = decoded;
    next();
  });
};

async function run() {
  try {
    const serviceCollection = client
      .db("flytographerDB")
      .collection("services");
    const reviewsCollection = client.db("flytographerDB").collection("reviews");

    //All service APIs here

    app.post("/service", async (req, res) => {
      const service = req.body;
      const result = await serviceCollection.insertOne(service);
      res.send(result);
    });

    app.get("/services", async (req, res) => {
      const dataLimit = parseInt(req.query.dataLimit);
      const query = {};
      const cursor = serviceCollection.find(query).sort({ serviceAddTime: -1 });
      if (dataLimit) {
        const result = await cursor.limit(dataLimit).toArray();
        return res.send(result);
      }
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/service/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await serviceCollection.findOne(query);
      res.send(result);
    });

    //All reviews APIs here

    app.post("/addReview", async (req, res) => {
      const review = req.body;
      const result = await reviewsCollection.insertOne(review);
      res.send(result);
    });

    app.get("/allReviews", async (req, res) => {
      const serviceId = req.query.service;
      const query = { serviceId: serviceId };
      const cursor = reviewsCollection.find(query).sort({ reviewDate: -1 });
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/userReviews", verifyJWT, async (req, res) => {
      const decoded = req.decoded;
      const userEmail = req.query.email;
      if (decoded.email !== userEmail) {
        return res.status(403).send({ message: "Forbidden" });
      }
      const query = { userEmail: userEmail };
      const cursor = reviewsCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });

    app.delete("/deleteReview", async (req, res) => {
      const id = req.query.id;
      const query = { _id: ObjectId(id) };
      const result = await reviewsCollection.deleteOne(query);
      res.send(result);
    });

    app.get("/review/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await reviewsCollection.findOne(query);
      res.send(result);
    });

    app.patch("/updateReview/:id", async (req, res) => {
      const id = req.params.id;
      const review = req.body;
      const query = { _id: ObjectId(id) };
      const updatedDoc = {
        $set: {
          review: review.updatedReview,
        },
      };
      const result = await reviewsCollection.updateOne(query, updatedDoc);
      res.send(result);
    });

    //JWT

    app.post("/jwt", async (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET);
      res.send({ token });
    });
  } finally {
  }
}

run().catch((error) => console.log(error));

app.get("/", (req, res) => {
  res.send("Flytographer server is running");
});

app.listen(port, () => {
  console.log(`flytographer server is running on port ${port}`);
});
