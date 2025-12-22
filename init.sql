CREATE TABLE perfis (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(20) UNIQUE NOT NULL
);

CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    senha TEXT NOT NULL,
    perfil_id INTEGER REFERENCES perfis(id)
);

CREATE TABLE tickets (
    id SERIAL PRIMARY KEY,
    solicitante_id INTEGER REFERENCES usuarios(id),
    analista_id INTEGER REFERENCES usuarios(id),
    titulo VARCHAR(255) NOT NULL CHECK (char_length(titulo) >= 10),
    descricao TEXT NOT NULL,
    prioridade VARCHAR(2) NOT NULL CHECK (prioridade IN ('P1', 'P2', 'P3')),
    status VARCHAR(30) DEFAULT 'Aguardando atendimento' 
        CHECK (status IN ('Aguardando atendimento', 'Em atendimento', 'Aguardando cliente', 'Respondido', 'Tratativa Interna', 'Resolvido')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE notas (
    id SERIAL PRIMARY KEY,
    ticket_id INTEGER REFERENCES tickets(id) ON DELETE CASCADE,
    autor_id INTEGER REFERENCES usuarios(id),
    conteudo TEXT NOT NULL,
    is_internal BOOLEAN DEFAULT FALSE,
    num_sequencial INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO perfis (nome) VALUES ('Solicitante'), ('Analista'), ('Admin');

INSERT INTO usuarios (nome, email, senha, perfil_id) VALUES 
('Gustavo Solicitante', 'user@teste.com', '123456', 1),
('Smaniotto Analista', 'analista@teste.com', '123456', 2),
('Admin Sistema', 'admin@teste.com', '123456', 3);

INSERT INTO tickets (solicitante_id, analista_id, titulo, descricao, prioridade, status) VALUES 
(1, NULL, 'Erro no acesso ao sistema OSS', 'Nao consigo logar na plataforma.', 'P1', 'Aguardando atendimento'),
(1, 2, 'Duvida sobre relatorio de notas', 'Como extrair as notas internas?', 'P3', 'Em atendimento');

INSERT INTO notas (ticket_id, autor_id, conteudo, is_internal, num_sequencial) VALUES 
(2, 2, 'Iniciando investigacao.', TRUE, 1),
(2, 2, 'Use o icone de impressora.', FALSE, 2);