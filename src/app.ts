import express, { Request, Response } from 'express';
import { identifyContact } from './routes';

const app = express();
const port = 4000;

app.use(express.json());

app.post('/identify', identifyContact);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
