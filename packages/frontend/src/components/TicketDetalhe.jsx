import React, { useState, useEffect, useCallback } from 'react';
import api from '../api/api';

const STATUS_FINALIZADOS = ['Resolvido', 'Fechado'];

const TicketDetalhe = ({ ticket, perfil, onTicketAtualizado, onFechar }) => {
    const [notas, setNotas] = useState([]);
    const [conteudo, setConteudo] = useState('');
    const [mensagem, setMensagem] = useState('');
    const [erro, setErro] = useState('');
    const [carregando, setCarregando] = useState(true);

    const finalizado = STATUS_FINALIZADOS.includes(ticket.status);

    // Solicitante não vê notas internas (RN-VIS-01) — filtro no frontend enquanto
    // o backend ainda não implementa a filtragem por is_internal
    const notasVisiveis = perfil === 1 ? notas.filter((n) => !n.is_internal) : notas;

    const buscarNotas = useCallback(async () => {
        setCarregando(true);
        try {
            const res = await api.get(`/tickets/${ticket.id}/notas`);
            setNotas(res.data);
        } catch {
            setErro('Erro ao carregar notas.');
        } finally {
            setCarregando(false);
        }
    }, [ticket.id]);

    useEffect(() => {
        buscarNotas();
    }, [buscarNotas]);

    const handleAdicionarNota = async (e) => {
        e.preventDefault();
        setMensagem('');
        setErro('');
        try {
            await api.post('/notas', { ticket_id: ticket.id, conteudo, is_internal: false });
            setConteudo('');
            setMensagem('Nota adicionada.');
            await buscarNotas();
        } catch (error) {
            setErro(error.response?.data?.error || 'Erro ao adicionar nota.');
        }
    };

    const handleFecharTicket = async () => {
        setErro('');
        setMensagem('');
        try {
            const res = await api.patch(`/tickets/${ticket.id}`, { status: 'Fechado' });
            setMensagem('Ticket encerrado.');
            if (onTicketAtualizado) onTicketAtualizado(res.data);
        } catch (error) {
            setErro(error.response?.data?.error || 'Erro ao fechar ticket.');
        }
    };

    const handleAssumirTicket = async () => {
        setErro('');
        setMensagem('');
        try {
            const res = await api.patch(`/tickets/${ticket.id}`, { acao: 'assumir' });
            setMensagem('Ticket assumido.');
            if (onTicketAtualizado) onTicketAtualizado(res.data);
        } catch (error) {
            setErro(error.response?.data?.error || 'Erro ao assumir ticket.');
        }
    };

    return (
        <div style={{ border: '1px solid #333', borderRadius: '6px', padding: '16px', marginTop: '8px', backgroundColor: '#1a1a1a' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                    <strong style={{ fontSize: '15px' }}>{ticket.titulo}</strong>
                    <p style={{ color: '#9ca3af', margin: '4px 0', fontSize: '14px' }}>{ticket.descricao}</p>
                    <p style={{ margin: '4px 0', fontSize: '13px', color: '#9ca3af' }}>
                        Status: <strong style={{ color: '#e5e7eb' }}>{ticket.status}</strong>
                        &nbsp;·&nbsp; Solicitante: {ticket.solicitante_nome}
                        &nbsp;·&nbsp; Analista: {ticket.analista_nome || '—'}
                    </p>
                </div>
                {onFechar && (
                    <button
                        onClick={onFechar}
                        data-cy={`btn-fechar-detalhe-${ticket.id}`}
                        style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '20px', color: '#6b7280', lineHeight: 1, marginLeft: '12px' }}
                    >
                        ✕
                    </button>
                )}
            </div>

            <div style={{ marginTop: '12px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {perfil === 1 && !finalizado && (
                    <button onClick={handleFecharTicket} data-cy={`btn-fechar-ticket-${ticket.id}`}>
                        Fechar ticket
                    </button>
                )}
                {perfil === 2 && (
                    <button onClick={handleAssumirTicket} data-cy={`btn-assumir-ticket-${ticket.id}`}>
                        Assumir ticket
                    </button>
                )}
            </div>

            <div style={{ marginTop: '20px' }}>
                <strong style={{ fontSize: '14px' }}>Histórico de notas</strong>
                {carregando ? (
                    <p style={{ color: '#6b7280', fontSize: '13px', marginTop: '6px' }}>Carregando...</p>
                ) : notasVisiveis.length === 0 ? (
                    <p style={{ color: '#6b7280', fontSize: '13px', marginTop: '6px' }} data-cy={`notas-vazia-${ticket.id}`}>
                        Nenhuma nota registrada.
                    </p>
                ) : (
                    <ol style={{ paddingLeft: '20px', marginTop: '8px' }} data-cy={`notas-lista-${ticket.id}`}>
                        {notasVisiveis.map((nota) => (
                            <li key={nota.num_sequencial} style={{ marginBottom: '12px', fontSize: '14px' }}>
                                <span style={{ color: '#6b7280', fontSize: '12px' }}>
                                    #{nota.num_sequencial} · {nota.autor_nome} · {new Date(nota.created_at).toLocaleString('pt-BR')}
                                    {nota.is_internal && (
                                        <span style={{ marginLeft: '6px', color: '#f59e0b', fontWeight: 'bold' }}>[interna]</span>
                                    )}
                                </span>
                                <p style={{ margin: '3px 0 0' }}>{nota.conteudo}</p>
                            </li>
                        ))}
                    </ol>
                )}
            </div>

            <div style={{ marginTop: '16px' }}>
                {finalizado ? (
                    <p style={{ color: '#6b7280', fontStyle: 'italic', fontSize: '13px' }} data-cy={`nota-bloqueada-${ticket.id}`}>
                        Este ticket está encerrado e não aceita mais notas.
                    </p>
                ) : (
                    <form onSubmit={handleAdicionarNota}>
                        <textarea
                            value={conteudo}
                            onChange={(e) => setConteudo(e.target.value)}
                            placeholder="Adicionar nota..."
                            rows={3}
                            required
                            style={{ width: '100%', resize: 'vertical', boxSizing: 'border-box' }}
                            data-cy={`nota-input-${ticket.id}`}
                        />
                        <button type="submit" style={{ marginTop: '6px' }} data-cy={`nota-submit-${ticket.id}`}>
                            Enviar nota
                        </button>
                    </form>
                )}
            </div>

            {mensagem && <p style={{ color: '#10b981', marginTop: '8px', fontSize: '13px' }}>{mensagem}</p>}
            {erro && <p style={{ color: '#ef4444', marginTop: '8px', fontSize: '13px' }}>{erro}</p>}
        </div>
    );
};

export default TicketDetalhe;
