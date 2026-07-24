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
    const bidsCollection = db.collection("bids");
    const users = db.collection("users");

    app.post("/users", async (req, res) => {
      const newUser = req.body;
      const query = { email: newUser.email };
      const existingUser = await users.findOne(query);
      if (existingUser) {
        res.send({ massage: "User already exist " });
      } else {
        const result = await users.insertOne(newUser);
        res.send(result);
      }
    });
    // products related apis here
    //send a user from the server to db through the thunder client (create operation)
    app.post("/products", async (req, res) => {
      const newProducts = req.body;
      const result = await productsCollection.insertOne(newProducts);
      res.send(result);
    });

    // //show the all products which is send through thunder client (read operation)
    // app.get("/products", async (req, res) => {
    //   const cursor = productsCollection.find();
    //   const result = await cursor.toArray();
    //   res.send(result);
    // });

    // <---------sort,limit,skip & project operation--------->
    app.get("/products", async (req, res) => {
      console.log(req.query);
      const email = req.query.email;
      const query = {};
      if (email) {
        query.email = email;
      }
      console.log(query);
      const sortFields = { price_min: 1 };
      const projectFields = { title: 1, price_min: 1, price_max: 1, email: 1 };
      const cursor = productsCollection
        .find()
        .sort(sortFields)
        .skip(5)
        .limit(10)
        .project(projectFields);

      //   /*Note:Remember the order of sort , limit & skip:
      //   sort-->skip-->limit*/

      //   //for the filtering through project operation by default always give _id . If we use _id:0 then id will be not given

      const result = await cursor.toArray();
      res.send(result);
    });

    //<---------Query operation---------->
    // app.get("/products", async (req, res) => {
    //   console.log(req.query)
    //   const email = req.query.email
    //   const query = {}
    //   if(email){
    //     query.email = email
    //   }
    //   console.log(query)
    //   const sortFields = {price_min:1}
    //   const projectFields = {title:1,price_min:1,price_max:1,email:1}
    //   const cursor = productsCollection.find(query).sort(sortFields).limit(10).project(projectFields);

    /*Note:Remember the order of sort , limit & skip:
      sort-->skip-->limit*/

    //for the filtering through project operation by default always give _id . If we use _id:0 then id will be not given

    //   const result = await cursor.toArray();
    //   res.send(result);
    // });

    //show a single product from the db
    app.get("/products/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await productsCollection.findOne(query);
      res.send(result);
    });

    //update a product from the db (update operation)
    app.patch("/products/:id", async (req, res) => {
      const id = req.params.id;
      const updatedProduct = req.body;
      const query = { _id: new ObjectId(id) };
      const update = {
        $set: {
          name: updatedProduct.name,
          price: updatedProduct.price,
        },
      };
      const result = await productsCollection.updateOne(query, update);
      res.send(result);
    });

    //delete a products from the db (delete operation)
    app.delete("/products/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await productsCollection.deleteOne(query);
      res.send(result);
    });

    //bids related apis here
    app.get("/bids", async (req, res) => {
      const email = req.query.email;
      const query = {};
      if (email) {
        query.buyer_email = email;
      }
      const cursor = bidsCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });

    //get bid single item through id
    app.get("/bids/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: id };
      const result = await bidsCollection.findOne(query);
      res.send(result);
    });

    //send bid to the db
    app.post("/bids", async (req, res) => {
      const newBid = req.body;
      const result = await bidsCollection.insertOne(newBid);
      res.send(result);
    });

    //for show ping in the server side console
    await client.db("admin").command({ ping: 1 });
    // console.log("👍 Connected successfully!");
    console.log("✅connected to Mongodb!");
  } finally {
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`smart deals server is running on port ${port}`);
});
