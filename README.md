 WhatsApp 2 - Fullstack (React + Node + PostgreSQL)
Este projeto é um clone funcional do WhatsApp Web, permitindo registro de usuários, login separado, troca de foto de perfil e mensagens em tempo real conectadas a um banco de dados.

 Funcionalidades
Sistema de Usuários: Registro e Login separados.

Perfil Personalizável: Alteração de nome, senha e foto de perfil (via URL).

Chat em Tempo Real: Envio e recebimento de mensagens filtradas por contato.

Banco de Dados: Persistência total de dados com PostgreSQL.

🛠️ Como instalar e rodar 
Se você acabou de baixar o projeto do GitHub, siga estes passos exatamente nesta ordem:

1. Instalar as dependências
Abra o terminal na pasta do projeto e instale as bibliotecas necessárias (isso recriará a pasta node_modules que não foi enviada ao Git):

Bash
npm install
2. Configurar o Banco de Dados (pgAdmin)
Certifique-se de que o PostgreSQL está rodando e crie um banco chamado yubi.
Rode as queries para criar as tabelas (conforme estruturado no arquivo server.cjs):

SQL
-- Exemplo de coluna necessária para as fotos
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS foto_url TEXT;
3. Rodar o Back-end (Servidor)
Abra um terminal e inicie o servidor Node:

Bash
node server.cjs
Nota: Verifique se aparece a mensagem: 🚀 SERVIDOR RODANDO NA PORTA 3001.

4. Rodar o Front-end (Site)
Abra outro terminal. Se o comando abaixo der erro de "arquivo não encontrado", você precisa entrar na pasta correta primeiro:

Bash
cd "Sistema De Msg com DB e notificacao usando react -3"
npm run dev
⚠️ Atenção com as Pastas
Para que os comandos do npm funcionem, seu terminal deve estar dentro da pasta que contém o arquivo package.json. Se houver erro de ENOENT, use o comando cd indicado no passo 4.

   ---------Banco De Dados----------------
-- 1. Criar Tabela de Usuários
CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    nome_usuario VARCHAR(50) UNIQUE NOT NULL,
    senha TEXT NOT NULL,
    foto_url TEXT DEFAULT 'https://www.pngall.com/wp-content/uploads/5/Profile-PNG-File.png',
    online BOOLEAN DEFAULT false,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Criar Tabela de Mensagens
CREATE TABLE IF NOT EXISTS mensagens (
    id SERIAL PRIMARY KEY,
    remetente_id INTEGER REFERENCES usuarios(id),
    destinatario_id INTEGER REFERENCES usuarios(id),
    conteudo TEXT NOT NULL,
    lida BOOLEAN DEFAULT false,
    enviada_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Inserir Usuários de Teste (Opcional)
INSERT INTO usuarios (nome_usuario, senha) VALUES 
('Suporte Dev', '1234'),
('Cleber o assasino maluco doido', '1234')
ON CONFLICT (nome_usuario) DO NOTHING;

   ----------------------------------
 Tecnologias Utilizadas
Front-end: React, TypeScript, Vite, Tailwind CSS, Lucide React.

Back-end: Node.js, Express, Cors.

Banco de Dados: PostgreSQL (pg pool).
