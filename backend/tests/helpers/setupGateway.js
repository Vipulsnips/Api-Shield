const  createUserAndLogin  = require("./auth");
const  createService  = require("./service");
const  createApiKey  = require("./apiKey");

async function setupGateway() {
  const token = await createUserAndLogin();

  const service = await createService(token);

  const apiKey = await createApiKey(token, service.body._id);

  return {
    token,
    service,
    apiKey,
  };
}

module.exports = setupGateway;
