import React, { useState, useEffect } from 'react';
import { DragDropContext } from '@hello-pangea/dnd';
import api from '../api/api';
import { decodeToken } from '../utils/auth';
import KanbanColuna from '../components/KanbanColuna';
import ModalTicket from '../components/ModalTicket';
import FiltroAnalistas from '../components/FiltroAnalistas';

const COLUNAS = [
    'Aguardando atendimento',
    'Em atendimento',
    'Aguardando cliente',
    'Respondido',
    'Tratativa Interna',
    'Resolvido',
    'Fechado',
];

const FilaGlobal = () => {
    const [tickets, setTickets] = useState([]);
    const [ticketSelecionado, setTicketSelecionado] = useState(null);
    const [erro, setErro] = useState('');

    const token = localStorage.getItem('token');
    const decoded = decodeToken(token);
    const perfil = decoded?.perfil;

    // Pré-seleciona o analista logado + tickets sem analista ao montar a tela
    const [analistasFiltro, setAnalistasFiltro] = useState([decoded?.id ?? null, null]);

    const carregarTickets = async () => {
        try {
            const response = await api.get('/tickets');
            setTickets(response.data);
        } catch {
            setErro('Erro ao carregar tickets.');
        }
    };

    useEffect(() => {
        carregarTickets();
    }, []);

    // Filtragem client-side: exibe tickets cujo analista_id está na seleção ativa
    // null na seleção representa os tickets sem analista atribuído
    const ticketsFiltrados = tickets.filter((t) => {
        if (t.analista_id === null) return analistasFiltro.includes(null);
        return analistasFiltro.includes(t.analista_id);
    });

    const ticketsPorStatus = (status) =>
        ticketsFiltrados.filter((t) => t.status === status);

    const handleDragEnd = async (result) => {
        const { destination, source, draggableId } = result;
        if (!destination) return;
        if (destination.droppableId === source.droppableId && destination.index === source.index) return;

        const novoStatus = destination.droppableId;
        const ticketId = Number(draggableId);

        // Atualização otimista: move o card imediatamente na UI
        setTickets((prev) =>
            prev.map((t) => (t.id === ticketId ? { ...t, status: novoStatus } : t))
        );

        try {
            const res = await api.patch(`/tickets/${ticketId}`, { status: novoStatus });
            setTickets((prev) =>
                prev.map((t) => (t.id === ticketId ? res.data : t))
            );
            if (ticketSelecionado?.id === ticketId) {
                setTicketSelecionado(res.data);
            }
        } catch (error) {
            setErro(error.response?.data?.error || 'Erro ao mover ticket.');
            // Reverte estado após falha
            carregarTickets();
        }
    };

    const handleTicketAtualizado = (ticketAtualizado) => {
        setTickets((prev) =>
            prev.map((t) => (t.id === ticketAtualizado.id ? ticketAtualizado : t))
        );
        setTicketSelecionado(ticketAtualizado);
    };

    const filtroVazio = analistasFiltro.length === 0;

    return (
        <div style={{ padding: '20px', height: '100vh', display: 'flex', flexDirection: 'column', boxSizing: 'border-box' }}>

            {/* Cabeçalho com título e barra de filtro */}
            <div style={{ marginBottom: '16px', flexShrink: 0 }}>
                <h2 style={{ margin: '0 0 12px' }}>Kanban — Fila Global</h2>
                <FiltroAnalistas
                    selecionados={analistasFiltro}
                    onChange={setAnalistasFiltro}
                />
            </div>

            {erro && (
                <p style={{ color: '#ef4444', marginBottom: '8px', flexShrink: 0 }} data-cy="fila-erro">
                    {erro}
                </p>
            )}

            {/* Aviso quando nenhum filtro está ativo */}
            {filtroVazio ? (
                <p style={{ color: '#6b7280', fontSize: '14px', marginTop: '8px' }} data-cy="fila-filtro-vazio">
                    Nenhum filtro ativo — selecione ao menos um analista para ver os tickets.
                </p>
            ) : (
                /* Kanban com 7 colunas — mantido montado mesmo com modal aberto para preservar scroll */
                <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', flexGrow: 1, alignItems: 'flex-start', paddingBottom: '16px' }}>
                    <DragDropContext onDragEnd={handleDragEnd}>
                        {COLUNAS.map((status) => (
                            <KanbanColuna
                                key={status}
                                status={status}
                                tickets={ticketsPorStatus(status)}
                                onCardClick={setTicketSelecionado}
                            />
                        ))}
                    </DragDropContext>
                </div>
            )}

            {/* Modal fullscreen — o Kanban fica montado por baixo, posição de scroll preservada */}
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

export default FilaGlobal;
