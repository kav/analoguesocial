import express from 'express';
import bodyParser from 'body-parser';

import signUp from './sign-up';
import sendSMS from './twilio-sms';
import ivr from './ivr';

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/ivr', ivr);

app.use(express.static('./static'));

app.use('/signup', signUp);
app.use('/message', sendSMS);

app.listen(process.env.PORT || 3000, () => {
  console.log('Listening');
});
