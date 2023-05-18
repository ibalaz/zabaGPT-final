const openAiService = require('../service/openAiService.js')

/*
{
  "configuration" : {
    "requestType" : "CODE_REVIEW", //BASIC_PROMPT
    "temperature" : 1
  },
  "codeSnippet" : "async function foo() {  return 1;}",
  "basicPrompt" : "Tell me a city in Croatia please."
}
*/

const getReview = async (req, res) => {
    try {
        const response = await openAiService.getReview(req.body)
        res.json({
            success: true,
            review: response.review
        });
    }
    /*try{

        let time = Date.now();
        let timeString = time.toString();
        res.json({
            success: true,
            review: "This is a response with time:" + timeString
        });

    }*/

    catch (err) {
        res.status(500)
        res.json({
            success: false,
            error: err.stack
        });
    }
}

module.exports.getReview = getReview;