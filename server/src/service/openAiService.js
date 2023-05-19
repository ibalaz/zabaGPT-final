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

    switch(requestType) {
      case 'CODE_REVIEW':
        prompt = process.env.CODE_REVIEW_PREFIX + JSON.stringify(body.codeSnippet);
        break;
      case 'CODE_REFACTOR':
        prompt = process.env.CODE_REFACTOR_PREFIX + JSON.stringify(body.codeSnippet);
        break;
      case 'BASIC_PROMPT':
        prompt = body.basicPrompt;
        break;
      case 'CODE_ISSUE_FIX':
        prompt = process.env.CODE_ISSUE_FIX_PREFIX + "Issue:" + JSON.stringify(body.codeIssue) + 'Code:' + JSON.stringify(body.codeSnippet);
        break;
      default:
        prompt = "Tell me your name.";
    }
      
      let temperature = body.configuration.temperature || parseInt(process.env.REVIEW_TEMPERATURE)

      console.log("requestType:" + requestType + ", temp:" + temperature + ", prompt:" + prompt)

      if(process.env.ENDPOINT_TYPE == 'COMPLETIONS') {
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
  
          reject(new Error ('Error in openAiService.getReview (COMPLETIONS) ->' + error))
        });
      }

      else if(process.env.ENDPOINT_TYPE == 'CHAT_COMPLETIONS') {
        openai.createChatCompletion({
          model: process.env.CHAT_COMPLETIONS_MODEL,
          messages: [{role: "user", content: prompt}],
        }).then( response => {
          let responseData = {
            success: true,
            review : response.data.choices[0].message.content
          }
          resolve(responseData)
        }).catch( error => {
          reject(new Error ('Error in openAiService.getReview (CHAT_COMPLETIONS)-> ' + error))
        });
      }
  })

  


}

module.exports.getReview = getReview;