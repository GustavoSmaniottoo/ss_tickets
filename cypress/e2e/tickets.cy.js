describe('Testes API- Módulo de Tickets', () => {

	let token; //variável para armazenar o token de autenticação
	let usuarioId; //variável para armazenar o ID do usuário criado
	let payloadTicket;

	beforeEach(() => { //primeiro reseto o banco de dados   
		cy.task('resetDb')

		//crio um usuário admin para autenticar e obter o token
		const payload = {
			nome: 'Gustavo Admin A',
			email: 'gustavo.admin@teste.com.br',
			senha: 'Gso@123456',
			perfil_id: 3
		}

		cy.createUsuario(payload).then((response) => {
			expect(response.status).to.equal(201)
		}).then((response) => {
			usuarioId = response.body.id //salvo o ID do usuário criado para usar posteriormente
			payloadTicket = {
				solicitante_id: usuarioId,
				titulo: "Ticket padrão para os testes.",
				descricao: "Essa é uma descrição de um ticket padrão.",
				prioridade: "P3"
			}

			//faço o login via API para obter o token
			cy.apiLogin(payload.email, payload.senha).then((tokenRetornado) => {
				expect(tokenRetornado).to.be.a('string')
				token = tokenRetornado
			})
		})
	})

	it('Deve criar um ticket com sucesso', () => {
		cy.createTicket(payloadTicket, token).then((response) => {
			expect(response.status).to.equal(201)
			expect(response.body.titulo).to.equal('Ticket padrão para os testes.')
		})
	})

	it('Deve criar um ticket e buscar pelo ID gerado', () => {
		cy.createTicket(payloadTicket, token).then((response) => {
			expect(response.status).to.equal(201)
			expect(response.body.titulo).to.equal('Ticket padrão para os testes.')
			const idTicket = response.body.id; //salvo o id numa variavel pra usar no GET

			cy.request({
				method: 'GET',
				url: `/tickets/${idTicket}`,
				headers: { Authorization: `Bearer ${token}` }
			}).then((responseGet) => {
				expect(responseGet.status).to.equal(200)
				expect(responseGet.body.id).to.equal(idTicket)
			})
		})
	})


	it('Deve validar a ausência de cada campo obrigatório', () => {

		const campos = ['solicitante_id', 'titulo', 'descricao', 'prioridade']

		campos.forEach(campo => {

			const payloadIncompleto = { ...payloadTicket }

			delete payloadIncompleto[campo]

			cy.createTicket(payloadIncompleto, token).then((response) => {
				expect(response.status).to.equal(400)
				expect(response.body.error).to.equal('Todos os campos são obrigatórios.')
				cy.log(`Validou com sucesso a ausência do campo: ${campo}`)
			})
		})
	})

	it('Deve validar cenários de dados inválidos para tickets', () => {

		const cenarios = [
			{
				label: 'Título curto (RN01)',
				extra: { titulo: 'Curto' }, // Menos de 10 caracteres 
				msg: 'O título deve ter pelo menos 10 caracteres.'
			},
			{
				label: 'Prioridade inválida',
				extra: { prioridade: 'P4' }, // Apenas P1, P2 ou P3 são aceitos 
				msg: 'Prioridade inválida. Use P1, P2 ou P3.'
			},
			{
				label: 'Solicitante inexistente',
				extra: { solicitante_id: 9999999 },
				msg: 'Usuário solicitante não encontrado.'
			}
		]

		cenarios.forEach((cenario) => {
			const payloadInvalido = { ...payloadTicket, ...cenario.extra };

			cy.createTicket(payloadInvalido, token).then((response) => {
				expect(response.status).to.equal(400)
				expect(response.body.error).to.equal(cenario.msg)
				cy.log(`Sucesso no cenário: ${cenario.label}`)
			})
		})
	})


	it('Deve listar todos os tickets cadastrados (Array)', () => {

		cy.request({
			method: 'GET',
			url: '/tickets',
			headers: { Authorization: `Bearer ${token}` }
		}).then((response) => {

			expect(response.status).to.equal(200);
			expect(response.body).to.be.an('array'); // Valida se o retorno é uma lista

		})
	})

	it('Deve retornar erro 404 ao buscar ticket passando uma string', () => {

		cy.request({
			method: 'GET',
			url: '/tickets/Letra',
			headers: { Authorization: `Bearer ${token}` },
			failOnStatusCode: false
		}).then((response) => {

			expect(response.status).to.equal(400)
			expect(response.body.error).to.equal('ID do ticket inválido, tem certeza que isso é um número de ticket?')
		})
	})

	it('Deve retornar erro 404 ao buscar ticket por um id invalido', () => {

		cy.request({
			method: 'GET',
			url: '/tickets/99999',
			failOnStatusCode: false,
			headers: { Authorization: `Bearer ${token}` }
		}).then((response) => {

			expect(response.status).to.equal(404)
			expect(response.body.error).to.equal('Ticket não encontrado.')
		})
	})

	it('Deve alterar o status do ticket pra um Status valido', () => {

		cy.createTicket(payloadTicket, token).then((response) => {
			expect(response.status).to.equal(201)
			expect(response.body.titulo).to.equal('Ticket padrão para os testes.')
			const ticketId = response.body.id;

			cy.request({
				method: 'PATCH',
				url: `/tickets/${ticketId}`,
				headers: { Authorization: `Bearer ${token}` },
				body: {
					status: 'Resolvido'
				}
			}).then((responsePatch) => {
				expect(responsePatch.status).to.equal(200)
				expect(responsePatch.body.id).to.equal(ticketId)
				expect(responsePatch.body.status).to.equal('Resolvido')
			})
		})
	})

	it('Deve impedir a alteração o status do ticket pra um Status invalido', () => {

		cy.createTicket(payloadTicket, token).then((response) => {
			expect(response.status).to.equal(201)
			expect(response.body.titulo).to.equal('Ticket padrão para os testes.')
			const ticketId = response.body.id;

			cy.request({
				method: 'PATCH',
				url: `/tickets/${ticketId}`,
				failOnStatusCode: false,
				headers: { Authorization: `Bearer ${token}` },
				body: {
					status: 'Invalido'
				}
			}).then((responsePatch) => {
				expect(responsePatch.status).to.equal(400)
				expect(responsePatch.body.error).to.include(`Status inválido. Escolha um dos status permitidos para o ticket.`)
			})
		})

	})

})