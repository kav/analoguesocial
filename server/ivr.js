import express from 'express';
import twilio from 'twilio';

// eslint-disable-next-line new-cap
const router = express.Router();

const viewInstagramPost = (twiml) => {
  twiml.gather({
    action: '/ivr/planets',
    numDigits: '1',
    method: 'POST',
  }, (node) => {
    node.say('At LOCATION on DATE at TIME, USERNAME took a photo of DESCRIPTION'
    + 'To like this photo, please press 1.'
    + 'To comment on this photo, please press 2.'
    + 'To share this photo, please press 3'
    + 'To view next photo, please press 4',
    { voice: 'alice', language: 'en-GB' });
  });
};

//   twiml.hangup();

const redirectWelcome = () => {
  const twiml = new twilio.TwimlResponse();
  twiml.say('Returning to the main menu', { voice: 'alice', language: 'en-GB' });
  twiml.redirect('/ivr/welcome');
  return twiml;
};


// POST: '/ivr/welcome'
router.post('/welcome', twilio.webhook({ validate: false }), (request, response) => {
  const twiml = new twilio.TwimlResponse();
  twiml.gather({
    action: '/ivr/menu',
    numDigits: '1',
    method: 'POST',
  }, (node) => {
    node.say('Welcome to Instagram. Capture and Share the World\'s Moments, ' +
      'Brought to you by Analogue Social; ' +
      'surfing the information superhighway at the pace of yesterday. ' +
      'To view your Instagram feed please press 1. ' +
      'To repeat this message please stay on the line. . .'
      , { loop: 3 });
  });
  response.send(twiml);
});

// POST: '/ivr/menu'
router.post('/menu', twilio.webhook({ validate: false }), (request, response) => {
  const selectedOption = request.body.Digits;
  const optionActions = {
    1: viewInstagramPost,
  };

  if (optionActions[selectedOption]) {
    const twiml = new twilio.TwimlResponse();
    optionActions[selectedOption](twiml);
    response.send(twiml);
  }
  response.send(redirectWelcome());
});

// POST: '/ivr/instagram_actions'
router.post('/instagram_actions', twilio.webhook({ validate: false }), (request, response) => {
  const selectedOption = request.body.Digits;
  const optionActions = {
    // 1: like,
    // 2: comment,
    // 3: share,
  };

  if (optionActions[selectedOption]) {
    const twiml = new twilio.TwimlResponse();
    twiml.dial(optionActions[selectedOption]);
    response.send(twiml);
  }
  response.send(redirectWelcome());
});

export default router;
