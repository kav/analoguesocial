import express from 'express';
import twilio from 'twilio';

import { menu, operator } from './ivr-common';
import { setCookie } from './cookie';

// eslint-disable-next-line new-cap
const router = express.Router();

router.post('/', twilio.webhook({ validate: false }), (request, response) => {
  const twiml = new twilio.TwimlResponse();
  twiml.gather({
    action: '/ivr/facebook/menu',
    numDigits: '10',
    method: 'POST',
  }, (node) => {
    node.say('Welcome to Facebook; Be Connected. Be Discovered. Be on Facebook. ' +
        'Brought to you by Analogue Social. ' +
        'surfing the information superhighway at the pace of yesterday. ' +
        'To post a to Facebook, please press 1. ' +
        'To view your Facebook feed, please press 2.');
  });
  const cookie = {
    postIndex: 0,
    token: igData.access_token,
    username: igData.user.username,
    bio: igData.user.bio,
    description: igData.user.description,
    profileImage: igData.user.profile_picture,
  };
  console.log(cookie);
  setCookie(request.body.From, cookie);
  return response.send(twiml);
});

// POST: '/ivr/facebook/menu'
router.post('/menu', twilio.webhook({ validate: false }), (request, response) => {
  menu(request, response, {
    1: (twiml, cookie, cb) => {
      twiml.redirect('/ivr/facebook/post', { method: 'POST' });
      cb();
    },
    2: (twiml, cookie, cb) => {
      twiml.redirect('/ivr/facebook/feed', { method: 'POST' });
      cb();
    },
  });
  return;
});

// POST: '/ivr/facebook/post'
router.post('/post', twilio.webhook({ validate: false }), (request, response) => {
  const twiml = new twilio.TwimlResponse();
  twiml.gather({
    action: '/ivr/facebook/post_menu',
    numDigits: '10',
    method: 'POST',
  }, (node) => {
    node.say(
        'To post a status update, please press 1. ' +
        'To post a photo, please press 2.');
  });
  return response.send(twiml);
});

// POST: '/ivr/facebook/post_menu'
router.post('/post_menu', twilio.webhook({ validate: false }), (request, response) => {
  menu(request, response, {
    1: (twiml, cookie, cb) => {
      twiml.redirect('/ivr/facebook/post/status', { method: 'POST' });
      cb();
    },
    2: (twiml, cookie, cb) => {
      twiml.redirect('/ivr/facebook/post/photo', { method: 'POST' });
      cb();
    },
  });
  return;
});

// POST: '/ivr/facebook/post/status'
router.post('/post/status', twilio.webhook({ validate: false }), (request, response) => {
  const twiml = new twilio.TwimlResponse();
  twiml.say('What\'s on your mind? ' +
    'Please record your status after the beep, when finished press star ',
    { voice: 'alice', language: 'en-GB' });
  twiml.record({
    transcribe: true,
    transcribeCallback: '/ivr/facebook/save_status',
    playBeep: true,
    finishOnKey: '*',
  });
  return response.send(twiml);
});

// POST: '/ivr/facebook/post/photo'
router.post('/post/photo', twilio.webhook({ validate: false }), (request, response) => {
  const twiml = new twilio.TwimlResponse();
  twiml.say('Please describe the photo you would like to post after the beep, ' +
    'when finished press star ',
    { voice: 'alice', language: 'en-GB' });
  twiml.record({
    transcribe: true,
    transcribeCallback: '/ivr/facebook/save_photo',
    playBeep: true,
    finishOnKey: '*',
  });
  return response.send(twiml);
});

const sayFacebookFeedActions = () => {
  // TODO: like or unlike
  // TODO: comment again perhaps
  const actions = [
    'To like this post, please press 1',
    'To comment on this post, please press 2',
    'To share this post, please press 3',
    'To listen to next post, please press 4',
    // 'To view this user\'s profile, please press 5',
    'To listen to this post again please press 6',
    'To repeat these options, please press 9',
    'Please press 0 to speak to a representative',
  ];
  return actions.join('. ');
};
const repeatPostOptions = (twiml, cookie, cb) => {
  twiml.gather({
    action: '/ivr/instagram_actions',
    numDigits: '1',
    method: 'POST',
  }, (node) => {
    node.say(sayFacebookFeedActions(),
    { voice: 'alice', language: 'en-GB' });
  });
  return cb();
};

// POST: '/ivr/facebook/actions'
router.post('/actions', twilio.webhook({ validate: false }), (request, response) => {
  menu(request, response, {
    // 1: likePost,
    // 2: commentOnPost,
    // 3: notImpl, // sharePost
    4: (twiml, cook, cb) => {
      cook.postIndex++;
      console.log(cook);
      setCookie(request.body.From, cook);
      twiml.redirect('/ivr/facebook/feed/', { method: 'POST' });
      cb();
    }, // nextPost
    // 5: viewProfile, // profilePhoto
    6: (twiml, cookie, cb) => {
      twiml.redirect('/ivr/facebook/feed', { method: 'POST' });
      cb();
    },
    9: repeatPostOptions,
    0: operator,
  });
  return;
});

// POST: '/ivr/facebook/feed'
router.post('/feed', twilio.webhook({ validate: false }), (request, response) => {
  const twiml = new twilio.TwimlResponse();
  twiml.gather({
    action: '/ivr/facebook/actions',
    numDigits: '1',
    method: 'POST',
  }, (node) => {
    node.say('post description',
      { voice: 'alice', language: 'en-GB' });
    node.pause();
    node.say(sayFacebookFeedActions(), { voice: 'alice', language: 'en-GB' });
  });
  return response.send(twiml);
});

router.post('/save_photo', twilio.webhook({ validate: false }), (request, response) => {
  // TODO: save photo update
  return response.send(200);
});

router.post('/save_status', twilio.webhook({ validate: false }), (request, response) => {
  // TODO: save status update
  return response.send(200);
});

export default router;
