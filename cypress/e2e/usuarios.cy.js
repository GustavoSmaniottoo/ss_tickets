describe('Testes API- Módulo Usuários', () => {

    context('Criação de usuarios (não exige Token) - Público', () => {
        
    //payload base para criação de usuário
          const payload = {
                    nome: 'Maiza Analista A',
                    email: 'maiza1@teste7.com.br',
                    senha: '123456',
                    perfil_id: 2
            }

        beforeEach(() => {
            cy.task('resetDb')//limpo o banco antes de cada teste
        })

        

        it('Deve criar um novo usuário e validar a integridade dos dados retornados', () => {
            
            cy.createUsuario(payload).then((response) => {
                expect(response.status).to.equal(201)
                expect(response.body.id).to.be.a('number')
                expect(response.body.nome).to.equal(payload.nome)
                expect(response.body.email).to.equal(payload.email)
                expect(response.body.senha).to.be.undefined //verifico se a senha não esta sendo retornada
            })
        })

        it('Deve impedir a criação de 2 usuários com o mesmo email', () =>{

            cy.createUsuario(payload).then((response) =>{
                expect(response.status).to.equal(201)
            })

            cy.createUsuario(payload).then((response) => {
                expect(response.status).to.equal(409)
                expect(response.body.message).to.equal('Este e-mail já está cadastrado no sistema.')
            }) 
        })

        it('Deve impedir a criação de um usuario quando faltar qualquer campo obrigatório', () =>{

            const campos = ['nome', 'email', 'senha', 'perfil_id']

            campos.forEach(campo => {
                
                //crio uma cópia do payload pra mante-lo integro, e quebrar apenas a cópia durante esse teste
                const payloadIncompleto = {...payload};

                //agora pra cada execução eu deleto um campo
                delete payloadIncompleto[campo];

                //agora faço o teste que vai se repetir dentro do forEach
                cy.createUsuario(payloadIncompleto).then((response) =>{
                    expect(response.status).to.equal(400)
                    expect(response.body.error).to.equal('Todos os campos são obrigatórios.')
                    //mostro qual campo estava faltando
                    cy.log(`Validou com sucesso a ausência do campo: ${campo}`)
                })
            })
        })

        it('Deve validar cenários de dados inválidos e impedir a criação do usuario.', () => {

            const cenarios = [//crio uma matriz de cenários de teste
                { 
                    label: 'email inválido', 
                    extra: { email: 'email-sem-arroba.com' }, 
                    msg: 'Email inválido.' 
                },
                { 
                    label: 'senha curta', 
                    extra: { senha: '123' }, 
                    msg: 'A senha deve ter pelo menos 6 caracteres.' 
                },
                { 
                    label: 'perfil inexistente', 
                    extra: { perfil_id: 999 }, 
                    msg: 'Perfil inválido' 
                }
            ]

            cenarios.forEach((cenario) => {//percorro cada cenário da matriz
               
                const payloadInvalido = { ...payload, ...cenario.extra }; //crio um novo payload mesclando o payload original com os dados inválidos do cenário atual
                //no JS se houve 2 atribuições para a mesma chave, a última sobrescreve a anterior
                //nesse caso o payloadInvalido vai ter o valor original do payload, mas a chave que está em extra vai sobrescrever o valor original

                cy.createUsuario(payloadInvalido).then((response) => {
                    expect(response.status).to.equal(400);
                    expect(response.body.error).to.equal(cenario.msg);
                    cy.log(`Sucesso no cenário: ${cenario.label}`);
                })
            })
        })     
    })

    context('Listagem de usuários (exige Token) - Privado', () => {

        let token; //variável para armazenar o token de autenticação
        let usuarioId; //variável para armazenar o ID do usuário criado

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
            }).then((response) =>{
                usuarioId = response.body.id //salvo o ID do usuário criado para usar posteriormente

                //faço o login via API para obter o token
                cy.apiLogin(payload.email, payload.senha).then((tokenRetornado) =>{
                    expect(tokenRetornado).to.be.a('string')
                    token = tokenRetornado
                })
            })
        })
        
        it('Deve listar todos os usuários do sistema com usuario logado', () => {

            cy.request({
                method: 'GET',
                url: '/usuarios',
                headers: { Authorization: `Bearer ${token}`} //incluo o token no cabeçalho da requisição
            }).then((response) => {
                expect(response.status).to.equal(200)
                expect(response.body).to.be.an('array')
                expect(response.body.length).to.be.greaterThan(0) //verifico se retornou pelo menos 1 usuário
            })
        })

        it('Deve impedir a listagem de usuários sem token de autenticação', () => {

            cy.request({
                method: 'GET',
                url: '/usuarios',
                failOnStatusCode: false
            }).then((response) => {
                expect(response.status).to.equal(401)
                expect(response.body.error).to.equal('Acesso negado. Token não fornecido.')
            })
        })

        it('Deve listar um usuário específico por ID com usuario logado', () => {
            //como estou limpando o banco a cada teste, sei que o ID 1 é o admin criado no beforeEach
            cy.request({
                method: 'GET',
                url: `/usuarios/${usuarioId}`,
                headers: { Authorization: `Bearer ${token}`} //incluo o token no cabeçalho da requisição
            }).then((response) => {
                expect(response.status).to.equal(200)
                expect(response.body).to.have.property('id', usuarioId)
                expect(response.body).to.have.property('usuario_nome', 'Gustavo Admin A')
            })    
        
        })   

    })

})

