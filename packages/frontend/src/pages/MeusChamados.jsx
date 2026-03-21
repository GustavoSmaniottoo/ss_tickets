import React, { useState, useEffect } from 'react';
import api from '../api/api';

const MeusChamados = () => {
    const [tickets, setTickets] = useState([]);
    const [titulo, setTitulo] = useState('');
    const [descricao, setDescricao] = useState('');
    const [prioridade, setPrioridade] = useState('P2'); // Valor padrão P2
    const [mensagem, setMensagem] = useState('');
    const [erro, setErro] = useState('');

    // Busca os tickets do solicitante ao carregar a página
    const carregarTickets = async () => {
        try {
            const response = await api.get('/tickets');
            setTickets(response.data);
        } catch (error) {
            console.error('Erro ao buscar tickets:', error);
        }
    };

    useEffect(() => {
        carregarTickets();
    }, []);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setErro('');
        setMensagem('');

        // Validação no frontend antes de chamar o backend (RN01)
        // O backend também bloqueia com 400, mas evitamos a chamada desnecessária
        if (titulo.trim().length < 10) {
            setErro('O título deve ter no mínimo 10 caracteres.');
            return;
        }

        try {
            // O solicitante_id é extraído do token pelo backend (req.usuarioId)
            // Não precisamos enviar o id do usuário no body
            await api.post('/tickets', { titulo, descricao, prioridade });

            setMensagem('Ticket criado com sucesso!');
            setTitulo('');
            setDescricao('');
            setPrioridade('P2');

            // Recarrega a lista após criar
            carregarTickets();
        } catch (error) {
            // Exibe o erro retornado pelo backend (ex: título inválido → 400)
            const msgErro = error.response?.data?.error || 'Erro ao criar ticket.';
            setErro(msgErro);
        }
    };

    return (
        <div style={{ padding: '20px', maxWidth: '700px', margin: 'auto' }}>
            <h2>Meus Chamados</h2>

            {/* Formulário de criação de ticket */}
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Título:</label>
                    <input
                        type="text"
                        value={titulo}
                        onChange={(e) => setTitulo(e.target.value)}
                        placeholder="Mínimo 10 caracteres"
                        data-cy="ticket-titulo"
                        required
                    />
                </div>

                <div style={{ marginTop: '10px' }}>
                    <label>Descrição:</label>
                    <textarea
                        value={descricao}
                        onChange={(e) => setDescricao(e.target.value)}
                        placeholder="Descreva o problema..."
                        data-cy="ticket-descricao"
                        rows={4}
                    />
                </div>

                {/* Campo prioridade exigido pelo backend (P1, P2, P3) */}
                <div style={{ marginTop: '10px' }}>
                    <label>Prioridade:</label>
                    <select
                        value={prioridade}
                        onChange={(e) => setPrioridade(e.target.value)}
                        data-cy="ticket-prioridade"
                    >
                        <option value="P1">P1 — Alta</option>
                        <option value="P2">P2 — Média</option>
                        <option value="P3">P3 — Baixa</option>
                    </select>
                </div>

                <button type="submit" style={{ marginTop: '15px' }} data-cy="ticket-submit">
                    Abrir Chamado
                </button>
            </form>

            {/* Feedback de sucesso ou erro */}
            {mensagem && <p style={{ color: 'green' }} data-cy="ticket-mensagem">{mensagem}</p>}
            {erro && <p style={{ color: 'red' }} data-cy="ticket-erro">{erro}</p>}

            {/* Lista de tickets */}
            <hr style={{ margin: '30px 0' }} />
            <h3>Chamados Abertos</h3>

            {tickets.length === 0 ? (
                <p data-cy="ticket-lista-vazia">Nenhum chamado encontrado.</p>
            ) : (
                <ul data-cy="ticket-lista">
                    {tickets.map((ticket) => (
                        <li key={ticket.id} data-cy={`ticket-item-${ticket.id}`}>
                            <strong>{ticket.titulo}</strong> — Status: {ticket.status} — Prioridade: {ticket.prioridade} — Solicitante: {ticket.solicitante_nome}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default MeusChamados;