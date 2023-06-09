const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion } = require("mongodb");
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ohr37qr.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    const classesCollection = client
      .db("footballAcademy")
      .collection("classes");
    const instructorsCollection = client
      .db("footballAcademy")
      .collection("instructors");

    // popular classes api
    app.get("/classes", async (req, res) => {
      const query = {};
      const options = {
        // sort returned documents in ascending order by title (A->Z)
        sort: { total_enrole: -1 },
      };
      const cursor = classesCollection.find(query, options).limit(6);
      const result = await cursor.toArray();
      res.send(result);
    });

    // all classes api
    app.get("/allClasses", async (req, res) => {
      const cursor = classesCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    // popular instructor api
    app.get('/instructors', async(req, res) => {
      const query = {};
      const options = {
        // sort returned documents in ascending order by title (A->Z)
        sort: { total_students: -1 },
      };
      const cursor = instructorsCollection.find(query, options).limit(6);
      const result = await cursor.toArray();
      res.send(result);
    });

    // all instructors api
    app.get('/allInstructors', async(req, res) => {
      const cursor = instructorsCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    })
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("football academy running");
});

app.listen(port, () => {
  console.log("this server is running on Port" + port);
});
