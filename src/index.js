// server set up
import express from 'express';
import receiptsRouter from './routes/receipts.js';

const app = express()

app.use(express.json());

// prefixes this to each route
app.use('/receipts', receiptsRouter);

app.listen(3000, ()=>{
    console.log('running on port 3000')
})