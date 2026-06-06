import React, { useState, useEffect } from 'react';
import api from '../api/api';

// Estilos dos chips de filtro — ativo = roxo, inativo = transparente
const estiloBotao = (ativo) => ({
    padding: '4px 14px',
    borderRadius: '20px',
    border: `1px solid ${ativo ? '#6366f1' : '#444'}`,
    backgroundColor: ativo ? '#6366f1' : 'transparent',
    color: ativo ? '#fff' : '#9ca3af',
    cursor: 'pointer',
    fontSize: '13px',
    whiteSpace: 'nowrap',
    transition: 'background-color 0.15s, border-color 0.15s',
});

const FiltroAnalistas = ({ selecionados, onChange }) => {
    const [analistas, setAnalistas] = useState([]);

    useEffect(() => {
        const buscar = async () => {
            try {
                const res = await api.get('/usuarios');
                // Mantém apenas analistas (perfil_id = 2), em ordem alfabética
                const filtrados = res.data
                    .filter((u) => u.perfil_id === 2)
                    .sort((a, b) => a.usuario_nome.localeCompare(b.usuario_nome, 'pt-BR'));
                setAnalistas(filtrados);
            } catch {
                // Filtro é opcional — erro silenciado para não bloquear o kanban
            }
        };
        buscar();
    }, []);

    const toggleItem = (id) => {
        if (selecionados.includes(id)) {
            onChange(selecionados.filter((s) => s !== id));
        } else {
            onChange([...selecionados, id]);
        }
    };

    return (
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', color: '#6b7280', marginRight: '2px' }}>
                Filtrar por:
            </span>

            {/* Chips dos analistas em ordem alfabética */}
            {analistas.map((analista) => (
                <button
                    key={analista.id}
                    onClick={() => toggleItem(analista.id)}
                    style={estiloBotao(selecionados.includes(analista.id))}
                    data-cy={`filtro-analista-${analista.id}`}
                >
                    {analista.usuario_nome}
                </button>
            ))}

            {/* "Não atribuído" sempre por último */}
            <button
                onClick={() => toggleItem(null)}
                style={estiloBotao(selecionados.includes(null))}
                data-cy="filtro-nao-atribuido"
            >
                Não atribuído
            </button>
        </div>
    );
};

export default FiltroAnalistas;
