import express from 'express';
import twilio from 'twilio';

const router = express.Router();
const client = twilio('AC941d110142d546bc70970e028751bbd2', 'd5d30b74960c418bace9405d07611915');

const sendSMS = (number, payload, cb) => {
  client.sendMessage({
    to: `+1${number}`,
    from: '+12025172625',
    body: payload,
  }, (err, responseData) => { // this function is executed when a response is received from Twilio
    if (!err) { // "err" is an error received during the request, if any
      console.log(responseData.from); // outputs "+14506667788"
      console.log(responseData.body); // outputs "word to your mother."
    }
    cb(err);
  });
};

router.post('/:number', (req, res) => {
  sendSMS(req.params.number, req.body.message, (err) => {
    if (err) res.status(400).send(err);
    res.send();
  });
});

export default router;
