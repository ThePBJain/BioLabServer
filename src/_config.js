var config = {};

// mongo uri
config.mongoURI = {
  development: "mongodb://localhost/bio-lab-server",
  test: "mongodb://localhost/node-stripe-charge-test",
  stage: process.env.MONGOLAB_URI
};

module.exports = config;