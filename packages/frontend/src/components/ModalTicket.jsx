import React, { useEffect } from 'react';
import TicketDetalhe from './TicketDetalhe';

const ModalTicket = ({ ticket, perfil, onTicketAtualizado, onFechar }) => {
    // Fecha com ESC e bloqueia scroll do body enquanto o modal está aberto
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') onFechar();
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.body.style.overflow = '';
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [onFechar]);

    return (
        // Overlay escuro — clicar fora do card fecha o modal
        <div
            onClick={onFechar}
            data-cy="modal-overlay"
            style={{
                position: 'fixed',
                inset: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.75)',
                zIndex: 200,
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'center',
                overflowY: 'auto',
                padding: '40px 20px',
            }}
        >
            {/* Caixa do modal — clique interno não propaga para o overlay */}
            <div
                onClick={(e) => e.stopPropagation()}
                data-cy="modal-conteudo"
                style={{
                    backgroundColor: '#111',
                    borderRadius: '8px',
                    border: '1px solid #333',
                    width: '100%',
                    maxWidth: '800px',
                    padding: '24px',
                    marginBottom: '40px',
                }}
            >
                <TicketDetalhe
                    ticket={ticket}
                    perfil={perfil}
                    onTicketAtualizado={onTicketAtualizado}
                    onFechar={onFechar}
                />
            </div>
        </div>
    );
};

export default ModalTicket;
