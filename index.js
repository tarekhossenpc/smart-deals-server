const express = require("express");
const cors = require("cors");
require("dotenv").config();
// console.log(process.env)
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 3000;

//middleware
app.use(cors());
app.use(express.json());

//Uniform resources identifier or Connection string (step-1)
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@tarek-hossen.t4byzjz.mongodb.net/?appName=Tarek-Hossen`;

//client(step-2)
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

//first time server testing
app.get("/", (req, res) => {
  res.send("smart deals server");
});

//async function (step-3)
async function run(params) {
  try {
    await client.connect();

    //for create a db & collection inside the mongodb
    const db = client.db("productsDB");
    const productsCollection = db.collection("productsCollection");

    //send a user from the server to db through the thunder client (create operation)
    app.post("/products", async (req, res) => {
      const newProducts = req.body;
      const result = await productsCollection.insertOne(newProducts);
      res.send(result);
    });

    //show the all products which is send through thunder client (read operation)
    app.get("/products", async (req, res) => {
      const cursor = productsCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    //delete a products from the db (delete operation)
    app.delete("/products/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await productsCollection.deleteOne(query);
      res.send(result);
    });

    //for show ping in the server side console
    await client.db("admin").command({ ping: 1 });
    // console.log("✅ Connected successfully!");
    console.log("❤️connected to Mongodb!");
  } finally {
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`smart deals server is running on port ${port}`);
});
