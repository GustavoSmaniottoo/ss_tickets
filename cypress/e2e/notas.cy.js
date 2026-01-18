describe('Testes API- Módulo de Notas', () =>{

    //vou deixar um usuario criado, o ticket e a nota eu vou criar dentro do it
    let usuarioId;
    let ticketId;

    beforeEach(() =>{

        cy.task('resetDb')//limpo o banco

        cy.request({
            method: 'POST',
            url: '/usuarios',
            body: {
                nome: "Maiza Cliente",
                email: "maiza1@test2e.com.br",
                senha: "123456",
                perfil_id: 1
            }

        }).then((resUser) =>{
            expect(resUser.status).to.equal(201)
            usuarioId = resUser.body.id;

        //vou criar um ticket aqui tambem, por que fora desse bloco o id do ticket nao vai estar definido
            cy.request({
            method: 'POST',
            url: '/tickets',
            body: {
                solicitante_id: usuarioId,
	            titulo: "Ticket A - Feito no BeforeEach",
	            descricao: "A sequencia estará certa?",
	            prioridade: "P1"
                }
            }).then((resTicket) =>{
                expect (resTicket.status).to.equal(201)
                ticketId = resTicket.body.id;
            })
        })
    })

    it('Deve adicionar uma nota a um ticket com sucesso', () => {
        
       cy.request({
        method: 'POST',
        url: '/notas',
        body: {
            ticket_id: ticketId,
            autor_id: usuarioId,
            conteudo: "Essa é a primeira nota do ticket"
        }
       }).then((resNota) =>{
        expect(resNota.status).to.equal(201)
        expect(resNota.body.conteudo).to.equal("Essa é a primeira nota do ticket")
       })
    
    })

    it('Valida o sequenciamento de notas do ticket A e B', () =>{

        //ja tenho um ticket criado no beforeEach, então crio o ticket B e 2 notas
        cy.request({
            method: 'POST',
            url: '/tickets',
            body:{
                solicitante_id: usuarioId,
	            titulo: "Ticket B - Feito no It",
	            descricao: "A sequencia estará certa?",
	            prioridade: "P2"
            }
        }).then((responseTicketB) =>{
            expect(responseTicketB.status).to.equal(201)
            const ticketIdB = responseTicketB.body.id

            cy.request({
                method: 'POST',
                url: '/notas',
                body:{
                    ticket_id: ticketIdB,
                    autor_id: usuarioId,
                    conteudo: "Essa é a primeira nota do ticket B"
            }
            }).then((responseNotaTicketB) =>{
                expect(responseNotaTicketB.status).to.equal(201)
                expect(responseNotaTicketB.body.num_sequencial).to.equal(1)
            })

            cy.request({
                method: 'POST',
                url: '/notas',
                body:{
                    ticket_id: ticketIdB,
                    autor_id: usuarioId,
                    conteudo: "Essa é a segunda nota do ticket B"
            }
            }).then((responseNotaTicketB) =>{
                expect(responseNotaTicketB.status).to.equal(201)
                expect(responseNotaTicketB.body.num_sequencial).to.equal(2)
            })
        })
        
        //agora eu crio uma nota pro ticket A, precisa ter o num_sequencial 1
        cy.request({
            method: 'POST',
            url: '/notas',
            body:{
                ticket_id: ticketId,
                autor_id: usuarioId,
                conteudo: "Essa é a primeira nota do ticket A"
            }
        }).then((responseTicketA) =>{
            expect(responseTicketA.status).to.equal(201)
            expect(responseTicketA.body.num_sequencial).to.equal(1)
        })

    })

    it('Deve impedir a criação de uma nota sem os campos obrigatórios', () =>{

        cy.request({
            method: 'POST',
            url: '/notas',
            failOnStatusCode: false,
            body:{
                autor_id: usuarioId,
                conteudo: "Essa é a primeira nota do ticket A"
                }
        }).then((response) =>{
            expect(response.status).to.equal(400)
            expect(response.body.error).to.equal("Valide os campos obrigatórios.")
        })

    })

    it('Deve impedir a criação de uma nota com o conteúdo vazio', () =>{
        cy.request({
            method: 'POST',
            url: '/notas',
            failOnStatusCode: false,
            body:{
                ticket_id: ticketId,
                autor_id: usuarioId,
                conteudo: "    "
                }
        }).then((response) =>{
            expect(response.status).to.equal(400)
            expect(response.body.error).to.equal("O conteúdo da nota não pode estar vazio.")
        })
    })

    it('Deve impedir a criação de uma nota se os IDs de ticket e autor não forem numéricos.', () =>{
        cy.request({
            method: 'POST',
            url: '/notas',
            failOnStatusCode: false,
            body:{
                ticket_id: "b",
                autor_id: "B",
                conteudo: "Teste de criação"
            }
        }).then((response) =>{
            expect(response.status).to.equal(400)
            expect(response.body.error).to.equal("Os IDs de ticket e autor devem ser numéricos.")
        })
    })

    it('Deve impedir a criaçã de uma nota que excede o limite de 5000 caracteres.', () =>{

    //crio uma variavel com um texto longo
        const longText = Cypress._.repeat('abcdefghijklmnopqrstuvwxyz', 200)
        expect(longText.length).to.be.greaterThan(5000) //verifico com o greaterThan se é "maior que" 5000

        cy.request({
            method: 'POST',
            url: '/notas',
            failOnStatusCode: false,
            body:{
                ticket_id: ticketId,
                autor_id: usuarioId,
                conteudo: longText
            }
        }).then((response) =>{
            expect(response.status).to.equal(400)
            expect(response.body.error).to.equal("A nota excede o limite de 5000 caracteres.")
        })
    })

    it('Deve impedir a criação de uma nota se o autor (usuário) informado não existir.', () =>{
        cy.request({
            method: 'POST',
            url: '/notas',
            failOnStatusCode: false,
            body:{
                ticket_id: ticketId,
                autor_id: usuarioId + 999999, //não é a melhor forma, mas por enquanto funciona
                conteudo: "Teste de criação"
            }
        }).then((response) =>{
            expect(response.status).to.equal(400)
            expect(response.body.error).to.equal("O autor (usuário) informado não existe.")
        })
    }) 
    
    it('Deve impedir a criação de uma nota se o ticket informado não existir.', () =>{
        cy.request({
            method: 'POST',
            url: '/notas',
            failOnStatusCode: false,
            body:{
                ticket_id: ticketId + 999999, //não é a melhor forma, mas por enquanto funciona
                autor_id: usuarioId,
                conteudo: "Teste de criação"
            }
        }).then((response) =>{
            expect(response.status).to.equal(400)
            expect(response.body.error).to.equal("O ticket informado não existe.")
        })
    })

    it('Deve impedir a adição de notas a um ticket resolvido ou fechado.', () =>{

        cy.request({
            method: 'PATCH',
            url: `/tickets/${ticketId}`, 
            body:{
                status: 'Resolvido'
            }
        }).then((response) =>{
            expect(response.status).to.equal(200)
            expect(response.body.id).to.equal(ticketId)
            expect(response.body.status).to.equal('Resolvido')

            cy.request({ //vou fazer a criação da nota dentro desse then, para garantir que o ticket já está resolvido
            method: 'POST',
            url: '/notas',
            failOnStatusCode: false,
            body:{
                ticket_id: ticketId,
                autor_id: usuarioId,
                conteudo: "Teste de criação de nota em ticket resolvido"
            }
            }).then((responseNotas) =>{
                expect(responseNotas.status).to.equal(403)
                expect(responseNotas.body.error).to.equal("Não é possível adicionar notas a um ticket com status Resolvido.")
            })
        })
       
    })

    it('Deve retornar as 2 notas de ticket criadas', () =>{
        cy.request({
        method: 'POST',
        url: '/notas',
        body: {
            ticket_id: ticketId,
            autor_id: usuarioId,
            conteudo: "Essa é a primeira nota do ticket"
            }
        })

        cy.request({
        method: 'POST',
        url: '/notas',
        body: {
            ticket_id: ticketId,
            autor_id: usuarioId,
            conteudo: "Essa é a segunda nota do ticket"
            }
        })

       cy.request({
            method: 'GET',
            url: `/tickets/${ticketId}/notas`
       }).then((response) =>{
            expect(response.status).to.equal(200)
            expect(response.body[0].num_sequencial).to.equal(1)
            expect(response.body[0].conteudo).to.equal("Essa é a primeira nota do ticket")
            expect(response.body[1].num_sequencial).to.equal(2)
            expect(response.body[1].conteudo).to.equal("Essa é a segunda nota do ticket")
       })
    })

      
})

