describe('Testes API- Módulo Usuários', () => {

    beforeEach(() => {
        //limpo o banco
        cy.task('resetDb')
    })

    //deixo um usario pronto pra evitar repetição de código
    const novoUsuario = {
            nome: 'Maiza Analista A',
            email: 'maiza1@teste7.com.br',
            senha: '123456',
            perfil_id: 2
    }

    it('Deve criar um novo usuário e validar a integridade dos dados retornados', () => {
        
        cy.request({
            method: 'POST',
            url: '/usuarios',
            body: novoUsuario    
              
        }).then((response) => {
            
            expect(response.status).to.equal(201)
            expect(response.body.id).to.be.a('number')//verifico o ID (se é um numero)
            expect(response.body.nome).to.equal(novoUsuario.nome)
            expect(response.body.email).to.equal(novoUsuario.email)
            expect(response.body.senha).to.be.undefined //verifico se a senha não esta sendo retornada
        }) 
    })

    it('Deve impedir a criação de 2 usuários com o mesmo email', () =>{

        cy.request({
            method: 'POST',
            url: '/usuarios',
            body: novoUsuario
        }).then((response) => {
            
            expect(response.status).to.equal(201)
        })

        cy.request({
            method: 'POST',
            url: '/usuarios',
            failOnStatusCode: false,
            body: novoUsuario
        }).then((response) => {
            
            expect(response.status).to.equal(409)
            expect(response.body.message).to.equal('Este e-mail já está cadastrado no sistema.')
        }) 

    })

    it('Deve impedir a criação de um usuario quando faltar campo obrigatório', () =>{

        cy.request({
            method: 'POST',
            url: '/usuarios',
            failOnStatusCode: false,
            body:{
                nome: 'Teste faltando campo',
                email: 'teste@teste.com'
            }
        }).then((response) =>{

            expect(response.status).to.equal(400)
            expect(response.body.error).to.equal('Todos os campos são obrigatórios.')
        })

    })

    it('Deve impedir a criação de um usuário com e-mail em formato inválido', () => {

        cy.request({
            method: 'POST',
            url: '/usuarios',
            failOnStatusCode: false,
            body: {
                nome: 'Usuário Errado',
                email: 'email-sem-arroba.com', // Formato inválido
                senha: '123456',
                perfil_id: 2
            }
        }).then((response) => {

            expect(response.status).to.equal(400)
            expect(response.body.error).to.equal('Email inválido.')
        })
    })

    it('Deve impedir a criação de um usuário com senha menor que 6 caracteres', () => {

        cy.request({
            method: 'POST',
            url: '/usuarios',
            failOnStatusCode: false,
            body: {
                nome: 'Senha Curta',
                email: 'senha@teste.com',
                senha: '12345', 
                perfil_id: 2
            }
        }).then((response) => {

            expect(response.status).to.equal(400)
            expect(response.body.error).to.equal('A senha deve ter pelo menos 6 caracteres.')
        })
    })

    it('Deve impedir a criação de usuário com perfil_id inexistente', () => {

        cy.request({
            method: 'POST',
            url: '/usuarios',
            failOnStatusCode: false,
            body: {
                nome: 'Perfil Fantasma',
                email: 'perfil@teste.com',
                senha: '123456',
                perfil_id: 999
            }
        }).then((response) => {

            expect(response.status).to.equal(400)
            expect(response.body.error).to.equal('Perfil inválido')
        })
    })

})

