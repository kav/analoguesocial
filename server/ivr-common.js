import twilio from 'twilio';

import { getCookie } from './cookie';

const redirectWelcome = () => {
  const twiml = new twilio.TwimlResponse();
  twiml.say('Returning to the main menu', { voice: 'alice', language: 'en-GB' });
  twiml.redirect('/ivr/welcome');
  return twiml;
};

export const menu = (request, response, optionActions) => {
  const selectedOption = request.body.Digits;
  getCookie(request.body.From, (cookie) => {
    if (optionActions[selectedOption]) {
      const twiml = new twilio.TwimlResponse();
      optionActions[selectedOption](twiml, cookie, () => response.send(twiml));
      return;
    }
    response.send(redirectWelcome());
    return;
  });
};

export const operator = (twiml, cookie, cb) => {
  twiml.dial('+12063312167');
  return cb();
};
