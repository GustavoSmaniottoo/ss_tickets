import React from 'react';
import { Droppable } from '@hello-pangea/dnd';
import KanbanCard from './KanbanCard';

const KanbanColuna = ({ status, tickets, onCardClick }) => {
    return (
        <div style={{
            minWidth: '210px',
            maxWidth: '210px',
            backgroundColor: '#141414',
            border: '1px solid #222',
            borderRadius: '8px',
            display: 'flex',
            flexDirection: 'column',
            flexShrink: 0,
        }}>
            <div style={{
                padding: '10px 12px',
                borderBottom: '1px solid #222',
                fontSize: '12px',
                fontWeight: 'bold',
                color: '#d1d5db',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
            }}>
                {status}
                <span style={{ marginLeft: '6px', color: '#4b5563', fontWeight: 'normal' }}>
                    ({tickets.length})
                </span>
            </div>

            <Droppable droppableId={status}>
                {(provided, snapshot) => (
                    <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        data-cy={`kanban-coluna-${status.replace(/\s+/g, '-').toLowerCase()}`}
                        style={{
                            padding: '8px',
                            flexGrow: 1,
                            minHeight: '80px',
                            backgroundColor: snapshot.isDraggingOver ? '#1c1c1c' : 'transparent',
                            transition: 'background-color 0.1s ease',
                        }}
                    >
                        {tickets.map((ticket, index) => (
                            <KanbanCard
                                key={ticket.id}
                                ticket={ticket}
                                index={index}
                                onCardClick={onCardClick}
                            />
                        ))}
                        {provided.placeholder}
                    </div>
                )}
            </Droppable>
        </div>
    );
};

export default KanbanColuna;
