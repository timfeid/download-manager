var env = require('dotenv').config();

module.exports = {
  uploaded: {
    username: env.UPLOADED_USERNAME,
    password: env.UPLOADED_PASSWORD
  },
  tempDir: './tmp/',
  downloadDir: './',
  parts: 8
};
