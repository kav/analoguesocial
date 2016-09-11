import express from 'express';
import twilio from 'twilio';
import { getIgData, precacheIgPosts, getPostForUser, likeIgPost, commentIgPost } from './instagram';
import { setCookie, getCookie } from './cookie.js';

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
      node.say(`${post.description} ${sayInstagramActions()}`,
        { voice: 'alice', language: 'en-GB' });
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
    return cb();
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
  return cb();
};

const commentOnPost = (twiml, cookie, cb) => {
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
  return cb();
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
  getIgData(request.body.From, (igData) => {
    precacheIgPosts(igData.user.username);
    const fullName = igData.user.full_name;
    const twiml = new twilio.TwimlResponse();
    twiml.gather({
      action: '/ivr/menu',
      numDigits: '10',
      method: 'POST',
    }, (node) => {
      node.say(`Welcome to insta gram ${fullName}. Capture and Share the World\'s Moments, ` +
          'Brought to you by Analogue Social. ' +
          'surfing the information superhighway at the pace of yesterday. ' +
          'To view your Insta gram feed, please press 1. ' +
          'If you are on a rotary telephone please hold for an operator.');
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

// POST: '/ivr/menu'
router.post('/menu', twilio.webhook({ validate: false }), (request, response) => {
  const selectedOption = request.body.Digits;
  getCookie(request.body.From, (cookie) => {
    const optionActions = {
      1: viewPost,
    };

    if (optionActions[selectedOption]) {
      const twiml = new twilio.TwimlResponse();
      optionActions[selectedOption](twiml, cookie, (twimlOutput) => response.send(twimlOutput));
      return;
    }
    response.send(redirectWelcome());
    return;
  });
});

// POST: '/ivr/instagram_actions'
router.post('/instagram_actions', twilio.webhook({ validate: false }), (request, response) => {
  const selectedOption = request.body.Digits;
  getCookie(request.body.From, (cookie) => {
    const optionActions = {
      1: likePost,
      2: commentOnPost,
      3: notImpl, // sharePost
      4: (twiml, cook, cb) => {
        cook.postIndex++;
        setCookie(request.body.From, cook);
        return viewPost(twiml, cook, cb);
      }, // nextPost
      5: viewProfile, // profilePhoto
      6: viewPost,
      9: repeatPostOptions,
      0: operator,
    };
    if (optionActions[selectedOption]) {
      const twiml = new twilio.TwimlResponse();
      optionActions[selectedOption](twiml, cookie, () => response.send(twiml));
      return;
    }
    response.send(redirectWelcome());
    return;
  });
});

// POST: '/ivr/save_comment'
router.post('/save_comment', twilio.webhook({ validate: false }), (request, response) => {
  console.log(request.body);
  const comment = request.body.TranscriptionText;
  commentIgPost(cookie.username, cookie.postIndex, cookie.token, comment);

  console.log(`Comment Transcription: ${comment}`);
  return response.send(200);
});
export default router;
