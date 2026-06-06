import React, { useState, useEffect } from 'react';
import api from '../api/api';
import { decodeToken } from '../utils/auth';
import PrioridadeBadge from '../components/PrioridadeBadge';
import ModalTicket from '../components/ModalTicket';

const STATUS_FINALIZADOS = ['Resolvido', 'Fechado'];

const MeusChamados = () => {
    const [tickets, setTickets] = useState([]);
    const [mostrarFormulario, setMostrarFormulario] = useState(false);
    const [titulo, setTitulo] = useState('');
    const [descricao, setDescricao] = useState('');
    const [prioridade, setPrioridade] = useState('P2');
    const [mensagem, setMensagem] = useState('');
    const [erro, setErro] = useState('');
    const [ticketSelecionado, setTicketSelecionado] = useState(null);

    const token = localStorage.getItem('token');
    const perfil = decodeToken(token)?.perfil;

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

        if (titulo.trim().length < 10) {
            setErro('O título deve ter no mínimo 10 caracteres.');
            return;
        }

        try {
            await api.post('/tickets', { titulo, descricao, prioridade });
            setMensagem('Ticket criado com sucesso!');
            setTitulo('');
            setDescricao('');
            setPrioridade('P2');
            // Fecha o formulário automaticamente após criar
            setMostrarFormulario(false);
            carregarTickets();
        } catch (error) {
            setErro(error.response?.data?.error || 'Erro ao criar ticket.');
        }
    };

    const handleAbrirFormulario = () => {
        setMostrarFormulario((v) => !v);
        setErro('');
        setMensagem('');
    };

    const handleTicketAtualizado = (ticketAtualizado) => {
        setTickets((prev) =>
            prev.map((t) => (t.id === ticketAtualizado.id ? ticketAtualizado : t))
        );
        setTicketSelecionado(ticketAtualizado);
    };

    return (
        <div style={{ padding: '20px', maxWidth: '800px', margin: 'auto' }}>

            {/* Cabeçalho com botão de abrir chamado em destaque */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ margin: 0 }}>Meus Chamados</h2>
                <button
                    onClick={handleAbrirFormulario}
                    data-cy="btn-abrir-chamado"
                    style={{
                        padding: '8px 16px',
                        backgroundColor: mostrarFormulario ? 'transparent' : '#6366f1',
                        color: mostrarFormulario ? '#9ca3af' : '#fff',
                        border: `1px solid ${mostrarFormulario ? '#444' : '#6366f1'}`,
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        fontSize: '14px',
                    }}
                >
                    {mostrarFormulario ? 'Cancelar' : '+ Abrir novo chamado'}
                </button>
            </div>

            {/* Formulário de criação — oculto por padrão, abre via botão */}
            {mostrarFormulario && (
                <div style={{ border: '1px solid #333', borderRadius: '6px', padding: '16px', marginBottom: '24px', backgroundColor: '#161616' }}>
                    <h3 style={{ margin: '0 0 16px', fontSize: '15px' }}>Novo chamado</h3>
                    <form onSubmit={handleSubmit}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '4px', fontSize: '13px', color: '#9ca3af' }}>
                                Título
                            </label>
                            <input
                                type="text"
                                value={titulo}
                                onChange={(e) => setTitulo(e.target.value)}
                                placeholder="Mínimo 10 caracteres"
                                data-cy="ticket-titulo"
                                required
                                style={{ width: '100%', boxSizing: 'border-box' }}
                            />
                        </div>
                        <div style={{ marginTop: '10px' }}>
                            <label style={{ display: 'block', marginBottom: '4px', fontSize: '13px', color: '#9ca3af' }}>
                                Descrição
                            </label>
                            <textarea
                                value={descricao}
                                onChange={(e) => setDescricao(e.target.value)}
                                placeholder="Descreva o problema..."
                                data-cy="ticket-descricao"
                                rows={4}
                                style={{ width: '100%', boxSizing: 'border-box', resize: 'vertical' }}
                            />
                        </div>
                        <div style={{ marginTop: '10px' }}>
                            <label style={{ display: 'block', marginBottom: '4px', fontSize: '13px', color: '#9ca3af' }}>
                                Prioridade
                            </label>
                            <select
                                value={prioridade}
                                onChange={(e) => setPrioridade(e.target.value)}
                                data-cy="ticket-prioridade"
                            >
                                <option value="P1">P1 — Crítica</option>
                                <option value="P2">P2 — Média</option>
                                <option value="P3">P3 — Baixa</option>
                            </select>
                        </div>
                        <button type="submit" style={{ marginTop: '15px' }} data-cy="ticket-submit">
                            Abrir Chamado
                        </button>
                    </form>

                    {mensagem && (
                        <p style={{ color: '#10b981', marginTop: '8px', fontSize: '13px' }} data-cy="ticket-mensagem">
                            {mensagem}
                        </p>
                    )}
                    {erro && (
                        <p style={{ color: '#ef4444', marginTop: '8px', fontSize: '13px' }} data-cy="ticket-erro">
                            {erro}
                        </p>
                    )}
                </div>
            )}

            {/* Lista de tickets — view principal ao entrar na tela */}
            {tickets.length === 0 ? (
                <p data-cy="ticket-lista-vazia">Nenhum chamado encontrado.</p>
            ) : (
                <ul style={{ listStyle: 'none', padding: 0 }} data-cy="ticket-lista">
                    {tickets.map((ticket) => {
                        const finalizado = STATUS_FINALIZADOS.includes(ticket.status);
                        return (
                            <li
                                key={ticket.id}
                                onClick={() => setTicketSelecionado(ticket)}
                                data-cy={`ticket-item-${ticket.id}`}
                                style={{
                                    border: '1px solid #333',
                                    borderRadius: '6px',
                                    padding: '12px 16px',
                                    marginBottom: '8px',
                                    opacity: finalizado ? 0.65 : 1,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                }}
                            >
                                <div>
                                    <strong style={{ fontSize: '14px' }}>
                                        {finalizado && (
                                            <span style={{ marginRight: '6px', fontSize: '12px' }}>🔒</span>
                                        )}
                                        {ticket.titulo}
                                    </strong>
                                    <div style={{ marginTop: '5px', display: 'flex', gap: '10px', alignItems: 'center' }}>
                                        <PrioridadeBadge prioridade={ticket.prioridade} />
                                        <span style={{ fontSize: '13px', color: '#9ca3af' }}>{ticket.status}</span>
                                    </div>
                                </div>
                                {/* Seta indicando que o item é clicável */}
                                <span style={{ color: '#4b5563', fontSize: '20px', marginLeft: '12px' }}>›</span>
                            </li>
                        );
                    })}
                </ul>
            )}

            {/* Modal fullscreen ao clicar em um ticket da lista */}
            {ticketSelecionado && (
                <ModalTicket
                    ticket={ticketSelecionado}
                    perfil={perfil}
                    onTicketAtualizado={handleTicketAtualizado}
                    onFechar={() => setTicketSelecionado(null)}
                />
            )}
        </div>
    );
};

export default MeusChamados;
