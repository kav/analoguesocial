import express from 'express';
import twilio from 'twilio';

import describeImage from './describe-image';

// eslint-disable-next-line new-cap
const router = express.Router();

const viewPost = (twiml) => {
  twiml.gather({
    action: '/ivr/instagram_actions',
    numDigits: '1',
    method: 'POST',
  }, (node) => {
    node.say('At LOCATION on DATE at TIME, USERNAME took a photo of DESCRIPTION '
    + 'To like this photo, please press 1. '
    + 'To comment on this photo, please press 2. '
    // + 'To share this photo, please press 3. '
    + 'To view next photo, please press 4. '
    + 'To view this user\'s profile photo, please press 5. '
    + 'To repeat these options, please press 7. ',
    { voice: 'alice', language: 'en-GB' });
  });
  return twiml;
};

const likePost = (twiml) => {
  twiml.gather({
    action: '/ivr/instagram_actions',
    numDigits: '1',
    method: 'POST',
  }, (node) => {
    node.say('Liked photo of DESCRIPTION At LOCATION on DATE at TIME by USERNAME '
    + 'To comment on this photo, please press 2. '
    // + 'To share this photo, please press 3. '
    + 'To view next photo, please press 4. '
    + 'To view this user\'s profile photo, please press 5. '
    + 'To repeat these options, please press 7. ',
    { voice: 'alice', language: 'en-GB' });
  });
  return twiml;
};

const commentOnPost = (twiml) => {
  twiml.gather({
    action: '/ivr/instagram_actions',
    numDigits: '1',
    method: 'POST',
  }, (node) => {
    node.say('Recording a comment '
    + 'on photo of DESCRIPTION At LOCATION on DATE at TIME by USERNAME, '
    + 'after the beep. To end comment press the pound sign. ',
    { voice: 'alice', language: 'en-GB' });
    node.record({
      transcribe: true,
      transcribeCallback: '/ivr/save_comment',
      playBeep: true,
    });
    node.say('Comment saved.'
    + 'To like this photo, please press 1. '
    + 'To comment again, please press 2. '
    // + 'To share this photo, please press 3. '
    + 'To view next photo, please press 4. '
    + 'To view this user\'s profile photo, please press 5. '
    + 'To repeat these options, please press 7. ',
    { voice: 'alice', language: 'en-GB' });
  });
  return twiml;
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
    numDigits: '10',
    method: 'POST',
  }, (node) => {
    node.say('Welcome to insta gram. Capture and Share the World\'s Moments, ' +
      'Brought to you by Analogue Social. ' +
      'surfing the information superhighway at the pace of yesterday. ' +
      // 'To view a friend\'s Instagram feed ' +
      // 'please enter their ten digit phone number followed by the pound sign. ' +
      'To view your insta gram feed please press 1. ' +
      'To repeat this message please stay on the line. . .'
      , { loop: 3 });
  });
  response.send(twiml);
});

// POST: '/ivr/menu'
router.post('/menu', twilio.webhook({ validate: false }), (request, response) => {
  const selectedOption = request.body.Digits;
  const optionActions = {
    1: viewPost,
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
    1: likePost,
    2: commentOnPost,
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
