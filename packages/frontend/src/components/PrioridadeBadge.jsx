import React from 'react';

const ESTILOS = {
    P1: { background: '#dc2626', color: '#fff', label: 'P1 — Crítica' },
    P2: { background: '#d97706', color: '#fff', label: 'P2 — Média' },
    P3: { background: '#16a34a', color: '#fff', label: 'P3 — Baixa' },
};

const PrioridadeBadge = ({ prioridade }) => {
    const estilo = ESTILOS[prioridade] ?? { background: '#6b7280', color: '#fff', label: prioridade };
    return (
        <span
            data-cy={`badge-prioridade-${prioridade}`}
            style={{
                backgroundColor: estilo.background,
                color: estilo.color,
                padding: '2px 8px',
                borderRadius: '4px',
                fontSize: '11px',
                fontWeight: 'bold',
                whiteSpace: 'nowrap',
            }}
        >
            {estilo.label}
        </span>
    );
};

export default PrioridadeBadge;
