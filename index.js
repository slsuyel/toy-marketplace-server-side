const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.37kn8jw.mongodb.net/?retryWrites=true&w=majority`;

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
    //await client.connect();
    // Send a ping to confirm a successful connection
    const toysCollection = client.db("toyMania").collection("toyManiaItems");

    app.get("/alltoys", async (req, res) => {
      const cursor = toysCollection.find().limit(20);
      const result = await cursor.toArray();
      res.send(result);
    });

    app.post("/toys", async (req, res) => {
      const toys = req.body;
      // console.log(bookings)
      const result = await toysCollection.insertOne(toys);
      res.send(result);
    });

    /*  app.get("/mytoys/:email", async (req, res) => {
      const toys = await toysCollection
        .find({
          sellerEmail: req.params.email,
        })
        .toArray();
      res.send(toys);
    }); */
    app.get("/mytoys/:email", async (req, res) => {
      const sortOrder = req.query.sortOrder || "asc";
      const toys = await toysCollection
        .find({
          sellerEmail: req.params.email,
        })
        .sort({ price: sortOrder === "asc" ? 1 : -1 })
        .toArray();
      res.send(toys);
    });

    app.get("/alltoys/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await toysCollection.findOne(query);
      res.send(result);
    });

    app.put("/alltoys/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updateToys = req.body;
      const toys = {
        $set: {
          price: updateToys.price,
          availableQuantity: updateToys.availableQuantity,
          detailDescription: updateToys.detailDescription,
        },
      };
      const result = await toysCollection.updateOne(filter, toys, options);
      res.send(result);
    });

    app.delete("/alltoys/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await toysCollection.deleteOne(query);
      res.send(result);
    });

    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    //await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("welcome to assignment-11");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
