
//Teste de Health Check da API
it('Health Check', () =>{

    cy.request({
      method: 'GET',
      url: '/health'
    }).then((response) =>{

      expect(response.status).to.equal(200)
      expect(response.body.message).to.equal('Backend e Banco de Dados conectados!')

    })
})