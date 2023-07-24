const express = require('express');
const cors = require('cors');
const jwt = require("jsonwebtoken");
const app = express();
require('dotenv').config();
const { MongoClient, ServerApiVersion } = require('mongodb');
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const username = process.env.DB_USER;
const password = process.env.DB_PASSWORD;

const uri = `mongodb+srv://${username}:${password}@cluster0.uz4gpo0.mongodb.net/?retryWrites=true&w=majority`;

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
    const usersCollection = client.db("bookMyCampus").collection("users");
    const collegesCollection = client.db("bookMyCampus").collection("colleges");

    app.post("/jwt", (req, res) => {
        const user = req.body;
        const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
          expiresIn: "1h",
        });
        res.send({ token });
      });

      app.post("/users", async (req, res) => {
        const user = req.body;
        const query = { email: user.email };
        const existingUser = await usersCollection.findOne(query);
        if (existingUser) {
          return res.send({ message: "User already exists" });
        }
        const result = await usersCollection.insertOne(user);
        res.send(result);
      });

      app.get("/colleges", async (req, res) => {
        const result = await collegesCollection.find().toArray();
        res.send(result);
      })

    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get("/", (req, res) => {
    res.send("Campus Booking process is ongoing!");
  });
  
  app.listen(port, () => {
    console.log(`Campus Server is listening on port: ${port}`);
  });