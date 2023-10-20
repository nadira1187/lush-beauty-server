const { MongoClient, ServerApiVersion } = require('mongodb');
const express = require ('express');
const { ObjectId } = require('mongodb');
const cors = require('cors');
require('dotenv').config()
const app =express();
const port =process.env.PORT|| 5000;

//middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.xwlezc0.mongodb.net/?retryWrites=true&w=majority`;
console.log(uri)

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
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const productCollection =client.db('productDB').collection('product')
    const brandCollection =client.db('brandDb').collection('brand');
    const cartCollection = client.db('cartDB').collection('cart');
    app.get('/product' , async(req,res) =>{
        const cursor =productCollection.find();
        const result = await cursor.toArray();
        res.send(result);
    })
    app.get('/brand' , async(req,res) =>{
        const cursor =brandCollection.find();
        const result = await cursor.toArray();
        res.send(result);
    })
    app.get('/product/:brand' , async(req,res) =>{
        const brand =req.params.brand;
        const result = await productCollection.find({brand:brand}).toArray();
        res.send(result);
    })
    app.get('/products/:id', async (req, res) => {
      const id = req.params.id; 
      const query ={_id: new ObjectId(id)}
      const result = await productCollection.findOne(query);
      res.send(result);
  });

    app.post(`/brand`,async(req,res) =>{
        const brandData = req.body;
        console.log(brandData);
        const result = await brandCollection.insertOne(brandData);
        res.send(result);
     })  

     app.post('/product',async(req,res) =>{
        const productData = req.body;
        console.log(productData);
        const result = await productCollection.insertOne(productData);
        res.send(result);
     })  
     app.post('/cart/:email',async(req,res) =>{
      const userEmail = req.params.email;
      const productData = req.body;
      console.log(productData);
      const cartItem ={email:userEmail,product:productData
      }
      const result = await cartCollection.insertOne(cartItem);
      res.send(result);
   })  
     app.put('/products/:id',async(req,res)=>{
      const id=req.params.id;
      const filter={_id: new ObjectId(id)}
      const options ={upsert:true};
      const updatedProduct =req.body;
      const product={
        $set:{
          image:updatedProduct.image,
           name:updatedProduct.name,
           brand:updatedProduct.brand,
            type:updatedProduct.type,
             price:updatedProduct.price,
              description:updatedProduct.description,
               rating:updatedProduct.rating

        }
      }
      const result= await productCollection.updateOne(filter,product,options);
      res.send(result);
     })






    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    //await client.close();
  }
}
run().catch(console.dir);



app.get('/',( req,res) => {
res.send('lush server is running')
})
app.listen( port, () => {
    console.log(`lush  is running on port : ${port}`)
})