import express from 'express';
import twilio from 'twilio';
import Firebase from 'firebase';

const rootRef = Firebase.database().ref();
const usersRef = rootRef.child('users');

// import describeImage from './describe-image';

// eslint-disable-next-line new-cap
const router = express.Router();

const notImpl = (twiml) => {
  twiml.say('Functionality not implemented. Goodbye.');
  // TODO: clear cookies
  twiml.hangup();
  return twiml;
};

const sayInstagramActions = () => {
  // TODO: like or unlike
  // TODO: comment again perhaps
  const actions = [
    'To like this photo, please press 1',
    'To comment on this photo, please press 2',
    'To share this photo, please press 3',
    'To view next photo, please press 4',
    'To view this user\'s profile, please press 5',
    'To view this photo again please press 6',
    'To repeat these options, please press 9',
    'Please press 0 to speak to a representative',
  ];
  return actions.join('. ');
};

const viewPost = (twiml) => {
  twiml.gather({
    action: '/ivr/instagram_actions',
    numDigits: '1',
    method: 'POST',
  }, (node) => {
    // TODO: load photo here
    node.say('At LOCATION on DATE at TIME, USERNAME took a photo of DESCRIPTION. '
    + `${sayInstagramActions()}`,
    { voice: 'alice', language: 'en-GB' });
  });
  return twiml;
};
const nextPost = (twiml) => {
  // TODO: advance post to next post
  return viewPost(twiml);
};

const viewProfile = (twiml) => {
  twiml.gather({
    action: '/ivr/instagram_actions',
    numDigits: '1',
    method: 'POST',
  }, (node) => {
    // TODO: load profile stuff here
    node.say('At LOCATION on DATE at TIME, USERNAME took a photo of DESCRIPTION. '
    + `${sayInstagramActions()}`,
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
    node.say('Liked photo. ' +
       `${sayInstagramActions()}`,
    { voice: 'alice', language: 'en-GB' });
  });
  return twiml;
};

const commentOnPost = (twiml) => {
  twiml.say('Please record your comment '
    + 'after the beep. To end comment press star. ',
    { voice: 'alice', language: 'en-GB' });
  twiml.record({
    transcribe: true,
    transcribeCallback: '/ivr/save_comment',
    playBeep: true,
    finishOnKey: '*',
  });
  twiml.gather({
    action: '/ivr/instagram_actions',
    numDigits: '1',
    method: 'POST',
  }, (node) => {
    node.say(`Comment saved. ${sayInstagramActions()}`,
    { voice: 'alice', language: 'en-GB' });
  });
  return twiml;
};

const repeatPostOptions = (twiml) => {
  twiml.gather({
    action: '/ivr/instagram_actions',
    numDigits: '1',
    method: 'POST',
  }, (node) => {
    node.say(sayInstagramActions(),
    { voice: 'alice', language: 'en-GB' });
  });
  return twiml;
};

const operator = (twiml) => {
  twiml.dial('+12063312167');
};
const redirectWelcome = () => {
  const twiml = new twilio.TwimlResponse();
  twiml.say('Returning to the main menu', { voice: 'alice', language: 'en-GB' });
  twiml.redirect('/ivr/welcome');
  return twiml;
};


// POST: '/ivr/welcome'
router.post('/welcome', twilio.webhook({ validate: false }), (request, response) => {
  // TODO: fetch user object from firebase
  // TODO: prime user's feed
  usersRef.child(request.body.From).on('value', (snapshot) => {
    const user = snapshot.val();
    console.log(user);
    console.log(snapshot);
    const twiml = new twilio.TwimlResponse();
    twiml.gather({
      action: '/ivr/menu',
      numDigits: '10',
      method: 'POST',
    }, (node) => {
      node.say('Welcome to insta gram. Capture and Share the World\'s Moments, ' +
        'Brought to you by Analogue Social. ' +
        'surfing the information superhighway at the pace of yesterday. ' +
        'To view your Insta gram feed, please press 1. ' +
        'If you are on a rotary telephone please hold for an operator.');
    });
    return response.send(twiml);
  });
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
    return response.send(twiml);
  }
  return response.send(redirectWelcome());
});

// POST: '/ivr/instagram_actions'
router.post('/instagram_actions', twilio.webhook({ validate: false }), (request, response) => {
  const selectedOption = request.body.Digits;
  const optionActions = {
    1: likePost,
    2: commentOnPost,
    3: notImpl, // sharePost
    4: nextPost, // nextPost
    5: viewProfile, // profilePhoto
    6: viewPost,
    9: repeatPostOptions,
    0: operator,
  };

  if (optionActions[selectedOption]) {
    const twiml = new twilio.TwimlResponse();
    optionActions[selectedOption](twiml);
    return response.send(twiml);
  }
  return response.send(redirectWelcome());
});

// POST: '/ivr/save_comment'
router.post('/save_comment', twilio.webhook({ validate: false }), (request, response) => {
  console.log(`Comment Transcription: ${request.body.TranscriptionText}`);
  return response.send(200);
});
export default router;
