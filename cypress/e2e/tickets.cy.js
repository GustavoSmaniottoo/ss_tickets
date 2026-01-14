describe('Testes API- Módulo de Tickets', () => {

let idUsuario //variavel para armazenar o id do usuário criado no beforeEach

beforeEach(() => {

    cy.task('resetDb') 
    //essa task foi definida no cypress.config.js, e serve pra limpar o banco de dados antes de cada teste
    //antes de criar tickets, preciso ter um usuário solicitante no banco de dados
    //por isso vou criar um usuário via API aqui no beforeEach do módulo de tickets
    cy.request({
        method: 'POST',
        url: 'usuarios',
        body:{
            nome: 'Gustavo Smaniotto',
            email: 'gustavo@teste6.com.br',
            senha: '123456',
            perfil_id: 3
        }
    }).then((response) => {
        expect(response.status).to.equal(201)
        idUsuario = response.body.id
    })
  
}) 

  it('Deve criar um ticket com sucesso com dados são válidos', () => {
    //o cy.request recebe um objeto com as propriedades da requisição
    //no caso de criação de ticket, precisamos definir o método, a url
    cy.request({
      method: 'POST',
      url: '/tickets',
      body: {
        solicitante_id: idUsuario,
        titulo: 'Cliente sem acesso a aplicação',
        descricao: 'O cliente X não esta conseguindo acessar aplicação, esta sendo exibido mensagem : [erro]',
        prioridade: 'P1'
      }
    }).then((response) => {
      expect(response.status).to.equal(201)
      expect(response.body.titulo).to.equal('Cliente sem acesso a aplicação')
    })
  })

  it('Deve listar todos os tickets cadastrados (Array)', () => {

    cy.request({
      method: 'GET',
      url:'/tickets'
    }).then((response) => {

      expect(response.status).to.equal(200);
      expect(response.body).to.be.an('array'); // Valida se o retorno é uma lista
      
    })
  })

  it('Deve retornar erro ao criar um ticket sem passar todos os campos obrigatórios',() => {

    cy.request({
      method: 'POST',
      url: '/tickets',
      failOnStatusCode: false, //serve para testes negativos, o cypress não para o teste ao receber código de erro
      body: {
        //não estou passando o solicitante_id
        titulo: 'Cliente sem acesso a aplicação',
        descricao: 'O cliente X não esta conseguindo acessar aplicação, esta sendo exibido mensagem : [erro]',
        prioridade: 'P1'
      }
    }).then((response) =>{
      expect(response.status).to.equal(400)
      expect(response.body.error).to.equal('Todos os campos são obrigatórios.')
    })
  })


  it('Deve retornar erro quando o título tem menos de 10 caracteres (RN01)',() =>{

    cy.request({
      method: 'POST',
      url: '/tickets',
      failOnStatusCode: false, //teste negativo
      body:{
        solicitante_id: idUsuario,
        titulo: 'Curto', //titulo curto (< 10)
        descricao: 'Descrição generica',
        prioridade: 'P3'
      }
    }).then((response) =>{
      expect(response.status).to.equal(400)
      expect(response.body.error).to.equal('O título deve ter pelo menos 10 caracteres.')
    })
  })

  it('Deve criar um ticket e buscar pelo ID gerado',() => {

     cy.request({
      method: 'POST',
      url: '/tickets',
      body: {
        solicitante_id: idUsuario,
        titulo: 'Devo conseguir buscar esse ticket pelo ID',
        descricao: 'O cliente precisa buscar o ticket por ID',
        prioridade: 'P2'
      }
    }).then((response) => {

      expect(response.status).to.equal(201) //verifico o status do response
      expect(response.body.id).to.be.a('number') //verifico se o id é um numero

      const idTicket = response.body.id; //salvo o id numa variavel pra usar no GET
      
      cy.request({ //faço um novo request, dessa vez passando o id criado pra trazer apenas ele
        method: 'GET',
        url: `/tickets/${idTicket}`
      }).then((response) =>{
        
        expect(response.status).to.equal(200)
        expect(response.body.id).to.equal(idTicket)
      })
    }) 
  })

  it('Deve retornar erro 404 ao buscar ticket passando uma string', () =>{

    cy.request({
      method: 'GET',
      url: '/tickets/Letra',
      failOnStatusCode: false
    }).then((response) =>{

      expect(response.status).to.equal(400)
      expect(response.body.error).to.equal('ID do ticket inválido, tem certeza que isso é um número de ticket?')
    })
  })

    it('Deve retornar erro 404 ao buscar ticket por um id invalido', () =>{

    cy.request({
      method: 'GET',
      url: '/tickets/99999',
      failOnStatusCode: false
    }).then((response) =>{

      expect(response.status).to.equal(404)
      expect(response.body.error).to.equal('Ticket não encontrado.')
    })
  })

})