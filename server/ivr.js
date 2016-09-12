import express from 'express';
import twilio from 'twilio';
import { getIgData, precacheIgPosts, getPostForUser, likeIgPost, commentIgPost } from './instagram';
import { setCookie, getCookie } from './cookie';
import facebookIVR from './facebook-ivr';
import { menu } from './ivr-common';

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
    // 'To view this user\'s profile, please press 5',
    'To view this photo again please press 6',
    'To repeat these options, please press 9',
    'Please press 0 to speak to a representative',
  ];
  return actions.join('. ');
};

const viewPost = (twiml, cookie, cb) => {
  getPostForUser(cookie.username, cookie.postIndex, (post) => {
    twiml.gather({
      action: '/ivr/instagram_actions',
      numDigits: '1',
      method: 'POST',
    }, (node) => {
      node.say(post.description,
        { voice: 'alice', language: 'en-GB' });
      node.pause();
      node.say(sayInstagramActions(), { voice: 'alice', language: 'en-GB' });
    });
    return cb(twiml);
  });
};

const viewProfile = (twiml, cookie, cb) => {
  twiml.gather({
    action: '/ivr/instagram_actions',
    numDigits: '1',
    method: 'POST',
  }, (node) => {
    // TODO: load profile stuff here
    node.say(`${cookie.bio}. Profile photo shows ${cookie.description}`
      + `${sayInstagramActions()}`,
      { voice: 'alice', language: 'en-GB' });
    return cb(twiml);
  });
};

const likePost = (twiml, cookie, cb) => {
  likeIgPost(cookie.username, cookie.postIndex, cookie.token);
  twiml.gather({
    action: '/ivr/instagram_actions',
    numDigits: '1',
    method: 'POST',
  }, (node) => {
    node.say('Liked photo. ' +
       `${sayInstagramActions()}`,
    { voice: 'alice', language: 'en-GB' });
  });
  return cb(twiml);
};

const commentOnPost = (twiml, cookie, cb) => {
  twiml.say('Please record your comment '
    + 'after the beep, to end comment press star. ',
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
  return cb(twiml);
};

const postImage = (twiml, cookie, cb) => {
  twiml.say('Please describe your image after the beep, when finished press star ',
    { voice: 'alice', language: 'en-GB' });
  twiml.record({
    transcribe: true,
    transcribeCallback: '/ivr/save_post',
    playBeep: true,
    finishOnKey: '*',
  });
  return cb(twiml);
};

const repeatPostOptions = (twiml, cookie, cb) => {
  twiml.gather({
    action: '/ivr/instagram_actions',
    numDigits: '1',
    method: 'POST',
  }, (node) => {
    node.say(sayInstagramActions(),
    { voice: 'alice', language: 'en-GB' });
  });
  return cb();
};

const operator = (twiml, cookie, cb) => {
  twiml.dial('+12063312167');
  return cb();
};

// POST: '/ivr/welcome'
router.post('/welcome', twilio.webhook({ validate: false }), (request, response) => {
  const twiml = new twilio.TwimlResponse();
  twiml.gather({
    action: '/ivr/main_menu',
    numDigits: '10',
    method: 'POST',
  }, (node) => {
    node.say('Welcome to Analogue Social, TAGLINE!' +
      'This call may be recorded for quality and training purposes. ' +
      'Listen carefully as our menu options have recently changed. ' +
      'To visit Insta gram please press 1' +
      'For Facebook please press 2.' +
      'If you are on a rotary telephone please hold for an operator.'
    );
  });
  return response.send(twiml);
});
router.use('/facebook', facebookIVR);

// POST: '/ivr/instagram'
router.post('/instagram', twilio.webhook({ validate: false }), (request, response) => {
  getIgData(request.body.From, (igData) => {
    precacheIgPosts(igData.user.username);
    const fullName = igData.user.full_name;
    const twiml = new twilio.TwimlResponse();
    twiml.gather({
      action: '/ivr/ig_menu',
      numDigits: '10',
      method: 'POST',
    }, (node) => {
      node.say(`Welcome to insta gram ${fullName}. Capture and Share the World\'s Moments, ` +
          'Brought to you by Analogue Social. ' +
          'surfing the information superhighway at the pace of yesterday. ' +
          'To post a new photo to your Insta gram feed, please press 1. ' +
          'To view your Insta gram feed, please press 2. ');
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
});

// POST: '/ivr/main_menu'
router.post('/main_menu', twilio.webhook({ validate: false }), (request, response) => {
  menu(request, response, {
    1: (twiml, cookie, cb) => {
      twiml.redirect('/ivr/instagram', { method: 'POST' });
      cb();
    },
    2: (twiml, cookie, cb) => {
      twiml.redirect('/ivr/facebook', { method: 'POST' });
      cb();
    },
  });
  return;
});

// POST: '/ivr/ig_menu'
router.post('/ig_menu', twilio.webhook({ validate: false }), (request, response) => {
  menu(request, response, {
    1: postImage,
    2: viewPost,
  });
  return;
});

// POST: '/ivr/instagram_actions'
router.post('/instagram_actions', twilio.webhook({ validate: false }), (request, response) => {
  menu(request, response, {
    1: likePost,
    2: commentOnPost,
    3: notImpl, // sharePost
    4: (twiml, cook, cb) => {
      cook.postIndex++;
      console.log(cook);
      setCookie(request.body.From, cook);
      return viewPost(twiml, cook, cb);
    }, // nextPost
    5: viewProfile, // profilePhoto
    6: viewPost,
    9: repeatPostOptions,
    0: operator,
  });
  return;
});

// POST: '/ivr/save_comment'
router.post('/save_comment', twilio.webhook({ validate: false }), (request, response) => {
  const comment = request.body.TranscriptionText;
  getCookie(request.body.From, (cookie) => {
    commentIgPost(cookie.username, cookie.postIndex, cookie.token, comment);
    console.log(`Comment Transcription: ${comment}`);
  });
  return response.send(200);
});

// POST: '/ivr/save_post'
router.post('/save_post', twilio.webhook({ validate: false }), (request, response) => {
  // const comment = request.body.TranscriptionText;
  // getCookie(request.body.From, (cookie) => {
  //   commentIgPost(cookie.username, cookie.postIndex, cookie.token, comment);
  //   console.log(`Comment Transcription: ${comment}`);
  // });
  return response.send(200);
});

export default router;
