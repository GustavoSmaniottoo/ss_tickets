// 1. Mapeamos os elementos do HTML para constantes no JS
const botao = document.getElementById('btn-carregar');
const lista = document.getElementById('container-tickets');

/**
 * Função para buscar dados da API.
 * Pense nela como o "Controller" do seu frontend.
 */
async function carregarDados() {
    try {
        // Equivale ao GET /tickets no seu ticketRoutes.js
        const response = await fetch('http://localhost:3000/tickets');
        
        // Converte o fluxo de bytes da rede em um Array de Objetos JSON
        const dados = await response.json();

        // Limpa o container antes de renderizar (evita duplicatas)
        lista.innerHTML = '';

        // Varre os dados vindo do db.query e transforma em HTML
        dados.forEach(ticket => {
            const div = document.createElement('div');
            div.className = 'ticket-box';
            div.setAttribute('data-cy', `item-${ticket.id}`);
            
            // Inserção de texto baseada nas colunas da sua tabela PostgreSQL
            div.innerHTML = `
                <h3>ID: ${ticket.id} - ${ticket.titulo}</h3>
                <p>Responsável: ${ticket.usuario_id || 'Não atribuído'}</p>
                <span class="status-aberto">Status: ${ticket.status}</span>
            `;
            
            lista.appendChild(div);
        });

    } catch (erro) {
        console.error("Erro na integração:", erro);
        lista.innerHTML = '<b style="color:red">Erro ao conectar com o servidor Express.</b>';
    }
}

// Ouve o clique do usuário para disparar a função
botao.addEventListener('click', carregarDados);