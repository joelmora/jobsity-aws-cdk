module.exports.handler = async event => {
  switch (event.resource) {
    case "/date":
      return {
        statusCode: 200,
        body: JSON.stringify({
          current: new Date()
        })
      };

    case "/hello":
      const name = (event.queryStringParameters && event.queryStringParameters.name) || "world";

      return {
        statusCode: 200,
        body: JSON.stringify({
          message: `Hello ${name}`
        })
      };
  }
};
