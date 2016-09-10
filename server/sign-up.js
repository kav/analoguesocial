import express from 'express';
import twilio from 'twilio';

const router = express.Router();

router.post('/', function(req, res, next) {
  console.log(req.body.handle);
  res.send(req.body);
});

export default router;