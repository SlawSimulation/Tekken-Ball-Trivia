const fetch = require('node-fetch');

(async () => {
  const apiKey = process.env.NINJA_API_KEY;
  const res = await fetch('https://api.api-ninjas.com/v1/trivia', {
    headers: {
      'X-Api-Key': apiKey
    }
  });

  const trivia = await res.json();
  require('fs').writeFileSync('./public/trivia.json', JSON.stringify(trivia, null, 2));
})();
