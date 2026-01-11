const { defineConfig } = require("cypress");

const db = require("./src/config/db");

module.exports = defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    baseUrl: "http://localhost:3000"
  },
});
