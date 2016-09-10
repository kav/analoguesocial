const imageFromDescription = (description, cb) => {
  if (!description) throw new Error('Must provide a description');
  if (!cb) throw new Error('Must provide a callback');

  console.log(`imaging: ${url}`);
  // https://api.cognitive.microsoft.com/bing/v5.0/images/search[?q][&count][&offset][&mkt][&safeSearch]
  fetch(`https://api.cognitive.microsoft.com/bing/v5.0/images/search?q=${description}&count=1`, {
    headers: {
      'Ocp-Apim-Subscription-Key': process.env.AS_BING_KEY,
    },
  }).then((res) => res.json())
  .then((json) => {
    const imageUrl = json.value[0].contentUrl;
    cnsole.log(`image: ${imageUrl}`);
    cb(imageUrl);
  });
};

export default imageFromDescription;
