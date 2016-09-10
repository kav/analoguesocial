import express from 'express';
import twilio from 'twilio';

// eslint-disable-next-line new-cap
const router = express.Router();

const giveExtractionPointInstructions = (twiml) => {
  twiml.say('To get to your extraction point, get on your bike and go down ' +
        'the street. Then Left down an alley. Avoid the police cars. Turn left ' +
        'into an unfinished housing development. Fly over the roadblock. Go ' +
        'passed the moon. Soon after you will see your mother ship.',
        { voice: 'alice', language: 'en-GB' });

  twiml.say('Thank you for calling the ET Phone Home Service - the ' +
        "adventurous alien's first choice in intergalactic travel");

  twiml.hangup();
  return twiml;
};

const listPlanets = (twiml) => {
  twiml.gather({
    action: '/ivr/planets',
    numDigits: '1',
    method: 'POST',
  }, (node) => {
    node.say('To call the planet Broh doe As O G, press 2. To call the planet ' +
            'DuhGo bah, press 3. To call an oober asteroid to your location, press 4. To ' +
            'go back to the main menu, press the star key ',
            { voice: 'alice', language: 'en-GB', loop: 3 });
  });
  return twiml;
};

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
    node.play('http://howtodocs.s3.amazonaws.com/et-phone.mp3', { loop: 3 });
  });
  response.send(twiml);
});

// POST: '/ivr/menu'
router.post('/menu', twilio.webhook({ validate: false }), (request, response) => {
  const selectedOption = request.body.Digits;
  const optionActions = {
    1: giveExtractionPointInstructions,
    2: listPlanets,
  };

  if (optionActions[selectedOption]) {
    const twiml = new twilio.TwimlResponse();
    optionActions[selectedOption](twiml);
    response.send(twiml);
  }
  response.send(redirectWelcome());
});

// POST: '/ivr/planets'
router.post('/planets', twilio.webhook({ validate: false }), (request, response) => {
  const selectedOption = request.body.Digits;
  const optionActions = {
    2: '+12024173378',
    3: '+12027336386',
    4: '+12027336637',
  };

  if (optionActions[selectedOption]) {
    const twiml = new twilio.TwimlResponse();
    twiml.dial(optionActions[selectedOption]);
    response.send(twiml);
  }
  response.send(redirectWelcome());
});

export default router;
