const express=require('express')
const morgan=require('morgan')
const cors=require('cors')
const mongoose=require('mongoose')
const bodyParser=require('body-parser')
require('dotenv').config()
// import routes
const postRoutes=require('./routes/post')

// app
const app=express()

// db
mongoose.connect(process.env.DATABASE,{
    useNewUrlParser:true,
    useCreateIndex:true,
    useFindAndModify:false,
    useUnifiedTopology:true
}).then(()=>{
    console.log(`DB connected`)
}).catch(err=>console.log(err))

// middlewares
app.use(cors())
app.use(morgan('dev'))
app.use(bodyParser.json())


// routes middlewars
app.use('/api',postRoutes)


// port
const port=process.env.PORT||8000
// listen
app.listen(port,()=>{
    console.log(`running on ${port}`)
})

