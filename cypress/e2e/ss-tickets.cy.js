describe('Testes de Integração - API SS Tickets', () => {
  
  it.only('Verifico se retorna Status 200 e se a estrutura do JSON esta correta', () => {
    
    cy.request('GET', 'http://localhost:3000/tickets')
      .then((response) =>{

        expect(response.status).to.eq(200)

        

      })
      
  })

})