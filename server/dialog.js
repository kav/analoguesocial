import describeImage from 'describe-image';
import user from 'wherever-you-get-a-user';

const onboard(user) = `Welcome to An A Log Oh Gram ${user.name}`;

const interactionBeginText = (user) => {
  const line = user.onboard
          ? `Welcome back, ${user.name}`
          : onboard(user);
};

const photoDescription = (url, cb) => {
  describeImage(url, (res) => {
    const imageDescription = res.data;
    const dialogue = <Say>{res.data}</Say><Pause length=2 />;
    cb(dialogue);
  });
};

const photoResponse = (cb) => {
  const dialogue = <Response>
      <Gather action="/like-or-share" method="GET">
        <Say>To like this photograph, press 1. To share it, press 2.
        </Say>
      </Gather>
    </Response>;
  cb(dialogue);
};

const shareDialogue = (cb) => {
  const dialogue = <Response>
      <Gather action="/share" method="GET">
        <Say>Someone needs to hear this photograph. Enter their phone number and press pound.
        </Say>
      </Gather>
  </Response>
};

const photoInteraction = (url) => {
};

const completeInteraction;
