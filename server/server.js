import path from 'path';
import express from 'express';
import bodyParser from 'body-parser';

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static('./static'));

app.listen(3000, () => {
  console.log('Listening on port 3000')
});
