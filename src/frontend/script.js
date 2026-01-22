// 1. Mapeamos os elementos do HTML para constantes no JS
const botao = document.getElementById('btn-load-tickets');
const lista = document.getElementById('container-tickets');
const botaoLoadUsers = document.getElementById('btn-load-users')
const listaUsers = document.getElementById('container-users')

/**
 * Função para buscar dados da API.
 * Pense nela como o "Controller" do seu frontend.
 */
    async function carregarTickets() {
        try {
            // Equivale ao GET /tickets no seu ticketRoutes.js
            const response = await fetch('http://localhost:3000/tickets');

            console.log('Objeto Response:', response);
            // Converte o fluxo de bytes da rede em um Array de Objetos JSON
            const dados = await response.json();

            console.log('Conteúdo dos Tickets:', dados);

            console.table(dados);

            // Limpa o container antes de renderizar (evita duplicatas)
            lista.innerHTML = '';

            // Varre os dados vindo do db.query e transforma em HTML
            dados.forEach(ticket => {
                const div = document.createElement('div');
                div.className = 'ticket-box';
                div.setAttribute('data-cy', `item-${ticket.id}`);
                
                // Inserção de texto baseada nas colunas da sua tabela PostgreSQL
                div.innerHTML = `
                    <h3>Ticket ${ticket.id} - ${ticket.titulo}</h3>
                    <p>Responsável: ${ticket.usuario_id || 'Não atribuído'}</p>
                    <p>Aqui é só pra eu entender como ficaria</><br>
                    <span>Status: ${ticket.status}</span>
                `;
                
                lista.appendChild(div);
            });

        } catch (erro) {
            console.error("Erro na integração:", erro);
            lista.innerHTML = '<b style="color:red">Erro ao conectar com o servidor Express.</b>';
        }
    }

    async function carregarUsers() {

        try{

            const response = await fetch('http://localhost:3000/usuarios'); //faço um fetch na rota de usuarios, recebo um objeto JS
            //console.log(response)

            const dados = await response.json(); //converto o objeto js em um JSON
            //console.log(dados)

            console.table(dados)

            listaUsers.innerHTML = '';

            dados.forEach(usuario =>{
                const div = document.createElement('div');
                
                div.innerHTML = `
                <h3>id: ${usuario.id} - ${usuario.usuario_nome}</h3>
                <p>Perfil: ${usuario.perfil}</p>
                <p>${usuario.email}</p>
                `
                listaUsers.appendChild(div);
            })

        } catch (error) {

        }
        
    }


// Ouve o clique do usuário para disparar a função
botao.addEventListener('click', carregarTickets);

botaoLoadUsers.addEventListener('click', carregarUsers);

