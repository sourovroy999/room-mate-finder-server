const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();

const express = require('express');
const cors = require('cors');

const app=express();
const port=process.env.PORT || 5000;

// // Define allowed origins based on environment
const allowedOrigins = [
  'https://room-mate-finder-auth-d2af4.web.app', // Production
];

// // Add development origins if not in production
if (process.env.NODE_ENV !== 'production') {
  allowedOrigins.push(
    'http://localhost:5173',
    'http://localhost:3000',
    'http://localhost:5000'
  );
}

app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true
}));

// app.use(cors())

app.use(express.json())


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.iy6spfv.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// const uri="mongodb://localhost:27017"




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
   
    await client.connect();

    const roomCollection=client.db('roomsDB').collection('rooms')

    //1.send data to mongodb
    app.post('/useraddedroom',async(req,res)=>{
        const newRoom=req.body;
        console.log(newRoom);
        
        
        const result=await roomCollection.insertOne(newRoom)
        res.send(result)
    })

    //2.read data in the server site
    app.get('/useraddedroom', async(req,res)=>{
        const cursor=roomCollection.find();
        const result=await cursor.toArray();
        res.send(result)
    })

    //get availiable data with limit operator
    app.get('/useraddedroom/availiable',async(req,res)=>{
      const cursor=roomCollection.find({availiability:"Yes"}).limit(6)
      const result=await cursor.toArray();
      res.send(result)
    })

    //3.get data by id
    app.get('/useraddedroom/:id',async(req,res)=>{
        const id=req.params.id;
        const query={_id: new ObjectId(id)}
        const result=await roomCollection.findOne(query);
        res.send(result)
    })


    //4.get data by email

    app.get('/mylisting/:email',async(req,res)=>{
        const email=req.params.email;
        console.log(email);
        
        const filter={email:email};
        const cursor=roomCollection.find(filter);

        const result=await cursor.toArray();
        res.send(result)
    })

    //delete a data

    app.delete('/useraddedroom/:id',async(req,res)=>{
        const id=req.params.id;
        const query={_id: new ObjectId(id)}
        const result=await roomCollection.deleteOne(query)
        res.send(result)
    })

    //update room details
    app.put('/useraddedroom/:id', async(req,res)=>{
      const id=req.params.id;
      const filter={_id: new ObjectId(id)}
      const options={upsert: true};
      const updatedRoom=req.body;
      const updatedDoc={
        $set:updatedRoom
      }

      const result=await roomCollection.updateOne(filter,updatedDoc,options)
      res.send(result)
    })

    // //update like btn
    // app.put('/useraddedroom/:id',async(req,res)=>{
    //   const id=req.params.id;
    //   const room=req.body;

    //   const filter={_id: new ObjectId(id)}
    //   const options={upsert: true}
    //   const updateRoom={
    //     $set:{
    //       totaluserlike:room.totalLike
    //     }
    //   }

    //   const result=await roomCollection.updateOne(filter,updateRoom,options)

    //   res.send(result)
    // })








    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req,res)=>{
    res.send('Room mate finder server is running')
})

app.listen(port, ()=>{
    console.log(`room mate server is running on port: ${port}`);
    
})

module.exports = app;