
import express from 'express';
import bodyParser from 'body-parser';
import signUp from './sign-up';
import facebookSignUp from './facebook-sign-up';
import ivr from './ivr';

// import api from './api';
import scrapper from './scrapper';

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// app.use('/api', api);
app.use('/ivr', ivr);
app.use('/scrapper', scrapper);

app.use(express.static('./static'));

app.use('/signup', signUp);
app.use('/fb-signup', facebookSignUp);

// app.use('/message', sendSMS);

app.listen(process.env.PORT || 3000, () => {
  console.log('Listening');
});
