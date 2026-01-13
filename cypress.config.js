const { defineConfig } = require("cypress");

const db = require("./src/config/db");

module.exports = defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      on('task', { //criei uma task personalizada para o Cypress para realizar uma ação no ambiente Node.js
        async resetDb() {//a ação é uma função assíncrona chamada resetDb
          //essa função vai limpar o banco de dados antes de cada teste 
          console.log("Limpando banco de dados para o teste...");
          try {
            //Dou um truncate nas tabelas que serão usadas nos testes
            // 'perfis' continua intacta (Seed Data).
            await db.query(`
              TRUNCATE TABLE 
                notas, 
                tickets, 
                usuarios 
              RESTART IDENTITY CASCADE
            `);
            return null; // O Cypress exige que retorne algo ou null
          } catch (error) {
            console.error("Erro ao limpar o banco:", error);
            throw error;
          }
        }
      });
    },
    baseUrl: "http://localhost:3000"
  },
});
