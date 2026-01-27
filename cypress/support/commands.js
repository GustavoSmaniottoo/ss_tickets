//comando customizado para realizar login via API
Cypress.Commands.add('apiLogin', (email, senha) =>{
    return cy.request({
        method: 'POST',
        url: 'usuarios/login',
        body:{email, senha}
    }).then((response) =>{
        return response.body.token
    })
})

//comando customizado para criar usuário via API
Cypress.Commands.add('createUsuario', (payload) =>{
    return cy.request({
        method: 'POST',
        url: '/usuarios',
        failOnStatusCode: false,
        body: payload
    })
})

//comando pra criar ticket via API
Cypress.Commands.add('createTicket', (payload, token = null) =>{
    const headers ={}; //crio um objeto vazio para os headers

    if (token) { //se o token for fornecido, incluo no cabeçalho
        headers.Authorization = `Bearer ${token}`;
    }
    
    return  cy.request({
		method: 'POST',
		url: '/tickets',
        failOnStatusCode: false,   
		body: payload,
        headers: headers //trago o Authorization que prenchi na condicional acima
	  })
})

