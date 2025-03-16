// netlify/functions/api.js
exports.handler = async function(event, context) {
  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      message: "Click Counter API is running on Netlify!",
      path: event.path,
      httpMethod: event.httpMethod
    })
  };
}; 