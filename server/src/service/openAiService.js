// For env. variables
const dotenv = require('dotenv');
dotenv.config({ path: './.env' });

const { Configuration, OpenAIApi } = require("openai");
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

const getReview = (body) => {
  return new Promise ((resolve, reject) => {
    let requestType = body.configuration.requestType
    let prompt;
    if(requestType == 'CODE_REVIEW') {
      prompt = process.env.CODE_REVIEW_PREFIX + JSON.stringify(body.codeSnippet)
    }
    else if (requestType == 'CODE_REFACTOR') {
      prompt = process.env.CODE_REFACTOR_PREFIX + JSON.stringify(body.codeSnippet)
    }
    else if (requestType == 'BASIC_PROMPT') {
      prompt = body.basicPrompt
    }
    else {
      prompt = "Tell me your name."
    }
      
      let temperature = body.configuration.temperature || parseInt(process.env.REVIEW_TEMPERATURE)

      console.log("requestType:" + requestType + ", temp:" + temperature + ", prompt:" + prompt)

      const openai = new OpenAIApi(configuration);
      openai.createCompletion({
        model: process.env.REVIEW_MODEL,
        prompt: prompt,
        max_tokens: parseInt(process.env.REVIEW_MAX_TOKENS),
        temperature: temperature,
      }).then( response => {
        let responseData = {
          success: true,
          review : response.data.choices[0].text
        }
        resolve(responseData)
      }).catch( error => {

        reject(new Error ('Error in openAiService.getReview -> ' + error))
      });
  })

  


}

module.exports.getReview = getReview;