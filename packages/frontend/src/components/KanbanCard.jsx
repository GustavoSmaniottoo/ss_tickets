import React from 'react';
import { Draggable } from '@hello-pangea/dnd';
import PrioridadeBadge from './PrioridadeBadge';

const STATUS_FINALIZADOS = ['Resolvido', 'Fechado'];

const KanbanCard = ({ ticket, index, onCardClick }) => {
    const finalizado = STATUS_FINALIZADOS.includes(ticket.status);

    return (
        <Draggable
            draggableId={String(ticket.id)}
            index={index}
            isDragDisabled={finalizado}
        >
            {(provided, snapshot) => (
                <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    onClick={() => onCardClick(ticket)}
                    data-cy={`kanban-card-${ticket.id}`}
                    style={{
                        backgroundColor: snapshot.isDragging ? '#2d2d2d' : '#1e1e1e',
                        border: `1px solid ${snapshot.isDragging ? '#555' : '#2a2a2a'}`,
                        borderRadius: '6px',
                        padding: '10px 12px',
                        marginBottom: '8px',
                        cursor: finalizado ? 'default' : 'grab',
                        opacity: finalizado ? 0.55 : 1,
                        userSelect: 'none',
                        ...provided.draggableProps.style,
                    }}
                >
                    <p style={{ margin: '0 0 5px', fontWeight: 'bold', fontSize: '13px', lineHeight: 1.3 }}>
                        {finalizado && <span style={{ marginRight: '5px', fontSize: '11px' }}>🔒</span>}
                        {ticket.titulo}
                    </p>
                    <p style={{ margin: '0 0 8px', fontSize: '12px', color: '#9ca3af' }}>
                        {ticket.solicitante_nome}
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <PrioridadeBadge prioridade={ticket.prioridade} />
                        <span style={{ fontSize: '11px', color: '#6b7280' }}>
                            {new Date(ticket.created_at).toLocaleDateString('pt-BR')}
                        </span>
                    </div>
                </div>
            )}
        </Draggable>
    );
};

export default KanbanCard;
