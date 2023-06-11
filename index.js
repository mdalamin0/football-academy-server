const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
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
    const usersCollection = client.db("footballAcademy").collection("users");
    const bookingCollection = client.db("footballAcademy").collection("booking");

    // users related api

    app.get("/users", async (req, res) => {
      const result = await usersCollection.find().toArray();
      res.send(result);
    });

    app.post("/users", async (req, res) => {
      const user = req.body;
      // console.log(user);
      const query = { email: user.email };
      const existingUser = await usersCollection.findOne(query);
      if (existingUser) {
        return res.send({ message: "user already exists" });
      }
      const result = await usersCollection.insertOne(user);
      res.send(result);
    });

    app.patch("/users/admin/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updatedDoc = {
        $set: {
          role: "admin",
        },
      };
      const result = await usersCollection.updateOne(filter, updatedDoc);
      res.send(result);
    });

    app.patch("/users/instructor/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updatedDoc = {
        $set: {
          role: "instructor",
        },
      };
      const result = await usersCollection.updateOne(filter, updatedDoc);
      res.send(result);
    });

    app.get("/users/admin/:email", async (req, res) => {
      const email = req.params.email;

      const query = { email: email };
      const user = await usersCollection.findOne(query);
      const result = { admin: user?.role == "admin" };
      res.send(result);
    });
    app.get("/users/instructor/:email", async (req, res) => {
      const email = req.params.email;
      console.log(email);
      const query = { email: email };
      const user = await usersCollection.findOne(query);
      const result = { admin: user?.role == "instructor" };
      res.send(result);
    });

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

    // add class
    app.post("/addClass", async (req, res) => {
      const {
        class_name,
        instructor_name,
        instructorEmail,
        available_seats,
        image,
        price,
      } = req.body;
      const newClass = {
        class_name,
        instructor_name,
        instructorEmail,
        available_seats,
        image,
        price,
        total_enrole: 0,
        status: "pending",
      };
      const result = await classesCollection.insertOne(newClass);
      res.send(result);
    });

    // classes by email

    app.get("/classesByEmail/:email", async (req, res) => {
      const email = req.params.email;
      // console.log(email)
      // const query = { email: instructorEmail };
      const cursor = classesCollection.find({
        instructorEmail: req.params.email,
      });
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/classesById/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await classesCollection.findOne(query);
      res.send(result);
    });

    app.put("/classesById/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const Class = req.body;
      const updatedClass = {
        $set: {
          class_name: Class.class_name,
          available_seats: Class.available_seats,
          image: Class.image,
          price: Class.price,
        },
      };
      const result = await classesCollection.updateOne(
        filter,
        updatedClass,
        options
      );
      res.send(result);
    });

    app.patch("/classes/updateStatus/:id", async (req, res) => {
      const id = req.params.id;
      // console.log(id);
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          status: "approved",
        },
      };
      const result = await classesCollection.updateOne(filter, updateDoc);
      res.send(result);
    });
    app.patch("/classes/updateStatus/:id", async (req, res) => {
      const id = req.params.id;
      // console.log(id);
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          status: "denied",
        },
      };
      const result = await classesCollection.updateOne(filter, updateDoc);
      res.send(result);
    });

    // popular instructor api
    app.get("/instructors", async (req, res) => {
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
    app.get("/allInstructors", async (req, res) => {
      const cursor = usersCollection.find({role: 'instructor'});
      const result = await cursor.toArray();
      res.send(result);
    });

    // student related api

    app.get('/booking', async(req, res) => {
      const cursor = bookingCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    })

    app.post('/booking', async(req, res) => {
      const selectedClass = req.body;
      const result = await bookingCollection.insertOne(selectedClass);
      res.send(result);
    });

    app.delete('/bookingById/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await bookingCollection.deleteOne(query);
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
