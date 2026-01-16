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
	            titulo: "Esse 2 ticket vai receber algumas notas",
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
      
})

