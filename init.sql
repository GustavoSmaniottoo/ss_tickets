-- 1. Tabela de Perfis
CREATE TABLE perfis (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(20) UNIQUE NOT NULL
);

-- 2. Tabela de Usuários (com a trava no perfil_id)
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    senha TEXT NOT NULL,
    perfil_id INTEGER NOT NULL REFERENCES perfis(id) --
);

-- 3. Tabela de Tickets (com a trava no solicitante_id)
CREATE TABLE tickets (
    id SERIAL PRIMARY KEY,
    solicitante_id INTEGER NOT NULL REFERENCES usuarios(id), --
    analista_id    INTEGER REFERENCES usuarios(id),          -- Pode ser nulo no início
    titulo         VARCHAR(255) NOT NULL CHECK (char_length(titulo) >= 10),
    descricao      TEXT NOT NULL,
    prioridade     VARCHAR(2) NOT NULL CHECK (prioridade IN ('P1', 'P2', 'P3')),
    status         VARCHAR(30) DEFAULT 'Aguardando atendimento' 
        CHECK (status IN ('Aguardando atendimento', 'Em atendimento', 'Aguardando cliente', 'Respondido', 'Tratativa Interna', 'Resolvido')),
    created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Tabela de Notas (com travas no ticket e autor)
CREATE TABLE notas (
    id SERIAL PRIMARY KEY,
    ticket_id      INTEGER NOT NULL REFERENCES tickets(id) ON DELETE CASCADE, --
    autor_id       INTEGER NOT NULL REFERENCES usuarios(id),                  --
    conteudo       TEXT NOT NULL,
    is_internal    BOOLEAN DEFAULT FALSE,
    num_sequencial INTEGER NOT NULL,
    created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================================
-- INSERÇÃO DE DADOS PADRÕES (SEEDS)
-- ==========================================================

-- Perfis base do sistema
INSERT INTO perfis (nome) VALUES ('Solicitante'), ('Analista'), ('Admin');

-- Usuários para testes iniciais
INSERT INTO usuarios (nome, email, senha, perfil_id) VALUES 
('Gustavo Solicitante', 'user@teste.com', '123456', 1),
('Smaniotto Analista', 'analista@teste.com', '123456', 2),
('Admin Sistema', 'admin@teste.com', '123456', 3);

-- Tickets iniciais para validar as listagens e JOINS
INSERT INTO tickets (solicitante_id, analista_id, titulo, descricao, prioridade, status) VALUES 
(1, NULL, 'Erro no acesso ao sistema OSS', 'Nao consigo logar na plataforma.', 'P1', 'Aguardando atendimento'),
(1, 2, 'Duvida sobre relatorio de notas', 'Como extrair as notas internas?', 'P3', 'Em atendimento');

-- Notas para validar o histórico do ticket
INSERT INTO notas (ticket_id, autor_id, conteudo, is_internal, num_sequencial) VALUES 
(2, 2, 'Iniciando investigacao.', TRUE, 1),
(2, 2, 'Use o icone de impressora.', FALSE, 2);