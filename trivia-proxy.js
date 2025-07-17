const fetch = require('node-fetch');
const fs = require('fs');

(async () => {
  const apiKey = process.env.NINJA_API_KEY;

  const fetches = Array.from({ length: 20 }, () =>
    fetch('https://api.api-ninjas.com/v1/trivia', {
      headers: { 'X-Api-Key': apiKey }
    }).then(res => res.json())
  );

  const questions = await Promise.all(fetches);
  const validQuestions = questions.filter(q => q && q.question);

  fs.writeFileSync('./public/trivia.json', JSON.stringify(validQuestions, null, 2));
})();
