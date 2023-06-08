import express, { Request, Response } from 'express';
import { identifyContact } from './routes';

require('dotenv').config();

const app = express();

app.use(express.json());

app.post('/identify', identifyContact);

app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});
