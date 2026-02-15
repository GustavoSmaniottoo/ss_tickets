describe('Testes API- Módulo de Notas', () =>{

    let token; 

	beforeEach(() => { 

        cy.task('resetDb');

		//crio um usuário
		const payloadUser = {
			nome: 'Gustavo Admin A',
			email: 'gustavo.admin@teste.com.br',
			senha: 'Gso@123456',
			perfil_id: 3
		};

		cy.createUsuario(payloadUser).then((response) => {
			expect(response.status).to.equal(201)
            return response.body.id;
		}).as('usuarioId'); //armazeno como alias o id do usuario

        //faço o login
        cy.apiLogin(payloadUser.email, payloadUser.senha).then((tokenRetornado) => {
			expect(tokenRetornado).to.be.a('string')
			token = tokenRetornado
       
            const payloadTicket = {
                titulo: "Ticket padrão para os testes.",
                descricao: "Descrição padrão.",
                prioridade: "P3"
            };

            cy.createTicket(payloadTicket, token).then((response) => {
                expect(response.status).to.equal(201)
                expect(response.body.titulo).to.equal('Ticket padrão para os testes.')
                return response.body.id;
            }).as('ticketId');
        
		 });
	});

    //nessa spec vou usar o function() para ter acesso ao this
    //do contrario (usando o arrow function) não teria acesso, e teria que dar um get nos alias

    it('Deve adicionar uma nota a um ticket com sucesso', function() {
        
        //crio o payload da nota
        const payloadNota = {
            ticket_id: this.ticketId, //o this tem acesso ao alias do ticket criado no beforeEach, que fica no objeto de contexto da spec
            conteudo: "Essa é a primeira nota do ticket"
        }
        cy.createNota(payloadNota, token).then((resNota) =>{
        expect(resNota.status).to.equal(201)
        expect(resNota.body.conteudo).to.equal(payloadNota.conteudo)
       })
    
    })

    it('Valida o sequenciamento de notas do ticket A e B', function() {

        /* Pra validar o sequenciamente independente, vou criar um ticketB e adicionar 2 notas ao mesmo, e validar o num_sequencial
        * Depois vou adicionar uma nota ao ticket A, e preciso validar que o num_sequencial da nota do ticket A é 1, e o num_sequencial da primeira nota do ticket B também é 1, ou seja, o sequenciamento é independente entre os tickets
        */
        const payloadTicketB = {
            titulo: "Ticket B para sequenciamento de notas.",
            descricao: "Descrição de um ticket padrão.",
            prioridade: "P3"
        };

        cy.createTicket(payloadTicketB, token).then((response) => {
            expect(response.status).to.equal(201);
            expect(response.body.titulo).to.equal(payloadTicketB.titulo);
            const ticketIdB = response.body.id;

            //crio a 1º nota pro ticket B, e valido que o num_sequencial é 1
            cy.createNota({ticket_id: ticketIdB, conteudo: "Nota 1 - Ticket B"}, token)
                .its('body.num_sequencial').should('eq', 1);
            //crio a 2º nota pro ticket B, e valido que o num_sequencial é 2
            cy.createNota({ticket_id: ticketIdB, conteudo: "Nota 2 - Ticket B"}, token)
                .its('body.num_sequencial').should('eq', 2);
            //crio a 1º nota pro ticket A, e valido que o num_sequencial é 1
            cy.createNota({ticket_id: this.ticketId, conteudo: "Nota 1 - Ticket A"}, token)
                .its('body.num_sequencial').should('eq', 1);
        })
    })

     it('Deve impedir a criação de uma nota com conteúdo vazio ou inválido', function() {
        
        const cenarios = [
            { extra: { conteudo: "   " }, erro: "O conteúdo da nota não pode estar vazio." },
            { extra: { ticket_id: "abc" }, erro: "O ID do ticket deve ser numérico." }
        ];

        cenarios.forEach(cenario => {
            const payloadInvalido = {
                ticket_id: this.ticketId,
                conteudo: "Nota Válida",
                ...cenario.extra
            };

            cy.createNota(payloadInvalido, token).then(res => {
                expect(res.status).to.equal(400);
                expect(res.body.error).to.equal(cenario.erro);
            });
        });
    });

    it('Deve retornar todas as notas de um ticket específico', function() {
        // Criamos duas notas em sequência
        cy.createNota({ ticket_id: this.ticketId, conteudo: "Nota 1" }, token);
        cy.createNota({ ticket_id: this.ticketId, conteudo: "Nota 2" }, token);

        cy.request({
            method: 'GET',
            url: `/tickets/${this.ticketId}/notas`,
            headers: { Authorization: `Bearer ${token}` }
        }).then(res => {
            expect(res.status).to.equal(200);
            expect(res.body).to.have.lengthOf(2);
            expect(res.body[0].num_sequencial).to.equal(1);
            expect(res.body[1].num_sequencial).to.equal(2);
        });
    });

    it('Deve impedir adição de notas a um ticket com status Resolvido (RN06)', function() {

        cy.request({
            method: 'PATCH',
            url: `/tickets/${this.ticketId}`,
            headers: { Authorization: `Bearer ${token}` },
            body: { status: 'Resolvido' }
        }).then((resPatch) => {
            expect(resPatch.status).to.equal(200); 

            const payloadNota = {
                ticket_id: this.ticketId,
                conteudo: "Tentativa de nota em ticket finalizado"
            };

            cy.createNota(payloadNota, token).then(res => {
                expect(res.status).to.equal(403); 
                expect(res.body.error).to.equal(`Não é possível adicionar notas a um ticket com status Resolvido.`)
            });
        });
    });
   
      
})

