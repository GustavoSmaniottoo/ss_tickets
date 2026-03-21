import React, { useState, useEffect } from 'react';
import api from '../api/api';

const FilaGlobal = () => {
    const [tickets, setTickets] = useState([]);
    const [erro, setErro] = useState('');

    // Busca apenas tickets sem analista atribuído (?sem_analista=true)
    // Esses são os tickets disponíveis na fila global para o analista assumir
    const carregarFila = async () => {
        try {
            const response = await api.get('/tickets?sem_analista=true');
            setTickets(response.data);
        } catch (error) {
            setErro('Erro ao carregar a fila de tickets.');
            console.error(error);
        }
    };

    useEffect(() => {
        carregarFila();
    }, []);

    // Envia PATCH com acao: 'assumir' — o backend extrai o analista_id do token
    // Se o ticket não tinha analista, status muda automaticamente para 'Em atendimento'
    const handleAssumirTicket = async (ticketId) => {
        try {
            await api.patch(`/tickets/${ticketId}`, { acao: 'assumir' });

            // Remove o ticket da fila local sem precisar recarregar tudo
            setTickets((prev) => prev.filter((t) => t.id !== ticketId));
        } catch (error) {
            const msgErro = error.response?.data?.error || 'Erro ao assumir ticket.';
            setErro(msgErro);
        }
    };

    return (
        <div style={{ padding: '20px', maxWidth: '800px', margin: 'auto' }}>
            <h2>Fila Global</h2>
            <p style={{ color: '#aaa' }}>Tickets aguardando atendimento — sem analista atribuído</p>

            {erro && <p style={{ color: 'red' }} data-cy="fila-erro">{erro}</p>}

            {tickets.length === 0 ? (
                <p data-cy="fila-vazia">Nenhum ticket na fila no momento.</p>
            ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }} data-cy="fila-tabela">
                    <thead>
                        <tr style={{ borderBottom: '1px solid #444', textAlign: 'left' }}>
                            <th style={{ padding: '8px' }}>#</th>
                            <th style={{ padding: '8px' }}>Título</th>
                            <th style={{ padding: '8px' }}>Solicitante</th>
                            <th style={{ padding: '8px' }}>Prioridade</th>
                            <th style={{ padding: '8px' }}>Aberto em</th>
                            <th style={{ padding: '8px' }}></th>
                        </tr>
                    </thead>
                    <tbody>
                        {tickets.map((ticket) => (
                            <tr
                                key={ticket.id}
                                style={{ borderBottom: '1px solid #333' }}
                                data-cy={`fila-ticket-${ticket.id}`}
                            >
                                <td style={{ padding: '8px' }}>{ticket.id}</td>
                                <td style={{ padding: '8px' }}>{ticket.titulo}</td>
                                <td style={{ padding: '8px' }}>{ticket.solicitante_nome}</td>
                                <td style={{ padding: '8px' }}>{ticket.prioridade}</td>
                                <td style={{ padding: '8px' }}>
                                    {new Date(ticket.created_at).toLocaleString('pt-BR')}
                                </td>
                                <td style={{ padding: '8px' }}>
                                    <button
                                        onClick={() => handleAssumirTicket(ticket.id)}
                                        data-cy={`btn-assumir-${ticket.id}`}
                                    >
                                        Assumir
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default FilaGlobal;