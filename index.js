const axios = require('axios');
const csv = require('csv-parser');
const fs = require('fs');

const OPENAI_API_KEY = "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"

const prompt = "Responda à pergunta com a maior sinceridade possível usando o texto fornecido e, se a resposta não estiver contida no texto abaixo, diga 'Não sei'.";
const context = "Copa do mundo 2002, O Brasil foi campeão, se tornando o unico penta campeão no ano de 2002."

async function askQuestion(question) {
  return new Promise((resolve, reject) => {
    const data = [];
    fs.createReadStream('ope.csv')
      .pipe(csv())
      .on('data', (row) => {
        data.push(row);
      })
      .on('end', async () => {
        for (let i = 0; i < data.length; i++) {
          const item = data[i];
          if (item.title && item.heading && item.content) {
            const title = item.title.trim().toLowerCase();
            const heading = item.heading.trim().toLowerCase();
            const content = item.content.trim();
            if (question.toLowerCase().includes(title) || question.toLowerCase().includes(heading)) {
              const response = await axios.post('https://api.openai.com/v1/engines/text-davinci-003/completions', {
                prompt: `${prompt}\n${context}\n${content}\nQ: ${question}\nA:`,
                max_tokens: 1024,
                n: 1,
                temperature: 0.5,
                frequency_penalty: 0.5,
                presence_penalty: 0.5,
                stop: "."
              }, {
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${OPENAI_API_KEY}`
                }
              });
              const answer = response.data.choices[0].text.trim();
              if (answer.toLowerCase() === "não sei") {
                continue;
              } else {
                resolve(answer);
              }
            }
          }
        }
        resolve("Não sei.");
      });
  });
}

const question = "Quem fez o Recorde mundial de 100 Metros Rasos?";
askQuestion(question)
  .then(answer => {
    console.log(`Q: ${question}\nA: ${answer}`);
  })
  .catch(error => {
    console.error(error);
  });