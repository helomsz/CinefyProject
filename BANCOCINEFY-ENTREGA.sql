-- ============================================
-- CRIAÇÃO DO BANCO DE DADOS
-- ============================================
DROP DATABASE IF EXISTS SERVIDORFILMES;
CREATE DATABASE SERVIDORFILMES;
USE SERVIDORFILMES;

-- ============================================
-- TABELA DE USUÁRIOS
-- ============================================
CREATE TABLE usuario (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    sobrenome VARCHAR(255) NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL,
    tipo ENUM('admin', 'comum') DEFAULT 'comum',
    data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABELAS BÁSICAS
-- ============================================
CREATE TABLE genero (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL
);

CREATE TABLE produtora (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL
);

CREATE TABLE diretor (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL
);

CREATE TABLE ator (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    fotoAtor VARCHAR(500) NOT NULL
);


-- ============================================
-- TABELA DE FILMES
-- ============================================
CREATE TABLE filme (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    sinopse TEXT,
    tempo_duracao INT,
    ano INT,
    poster VARCHAR(255),
    background VARCHAR(255),
    poster_mini VARCHAR(255),
    trailer VARCHAR(255),
    avaliacao_media varchar (5),
    status ENUM('aprovado', 'pendente') DEFAULT 'pendente',
    criado_por INT,
    FOREIGN KEY (criado_por) REFERENCES usuario(id) ON DELETE SET NULL
);

ALTER TABLE filme MODIFY COLUMN poster TEXT;
ALTER TABLE filme MODIFY COLUMN background TEXT;
ALTER TABLE filme MODIFY COLUMN poster_mini TEXT;

-- ============================================
-- TABELAS INTERMEDIÁRIAS DE RELACIONAMENTO
-- ============================================
CREATE TABLE filme_genero (
    filme_id INT,
    genero_id INT,
    PRIMARY KEY (filme_id, genero_id),
    FOREIGN KEY (filme_id) REFERENCES filme(id) ON DELETE CASCADE,
    FOREIGN KEY (genero_id) REFERENCES genero(id) ON DELETE CASCADE
);

CREATE TABLE filme_produtora (
    filme_id INT,
    produtora_id INT,
    PRIMARY KEY (filme_id, produtora_id),
    FOREIGN KEY (filme_id) REFERENCES filme(id) ON DELETE CASCADE,
    FOREIGN KEY (produtora_id) REFERENCES produtora(id) ON DELETE CASCADE
);

CREATE TABLE filme_diretor (
    filme_id INT,
    diretor_id INT,
    PRIMARY KEY (filme_id, diretor_id),
    FOREIGN KEY (filme_id) REFERENCES filme(id) ON DELETE CASCADE,
    FOREIGN KEY (diretor_id) REFERENCES diretor(id) ON DELETE CASCADE
);

CREATE TABLE filme_ator (
    filme_id INT,
    ator_id INT,
    PRIMARY KEY (filme_id, ator_id),
    FOREIGN KEY (filme_id) REFERENCES filme(id) ON DELETE CASCADE,
    FOREIGN KEY (ator_id) REFERENCES ator(id) ON DELETE CASCADE
);


-- ============================================
-- CATEGORIAS
-- ============================================
CREATE TABLE categoria (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL
);

CREATE TABLE filme_categoria (
    filme_id INT,
    categoria_id INT,
    PRIMARY KEY (filme_id, categoria_id),
    FOREIGN KEY (filme_id) REFERENCES filme(id) ON DELETE CASCADE,
    FOREIGN KEY (categoria_id) REFERENCES categoria(id) ON DELETE CASCADE
);

-- ============================================
-- FAVORITOS
-- ============================================
CREATE TABLE favorito (
    usuario_id INT,
    filme_id INT,
    PRIMARY KEY (usuario_id, filme_id),
    FOREIGN KEY (usuario_id) REFERENCES usuario(id) ON DELETE CASCADE,
    FOREIGN KEY (filme_id) REFERENCES filme(id) ON DELETE CASCADE
);


-- ============================================
-- NOTIFICAÇÕES (para o admin)
-- ============================================
CREATE TABLE notificacao (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT,
    tipo ENUM('novo_filme', 'edicao_filme') NOT NULL,
    filme_id INT,
    mensagem TEXT,
    lida BOOLEAN DEFAULT FALSE,
    data_envio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuario(id) ON DELETE SET NULL,
    FOREIGN KEY (filme_id) REFERENCES filme(id) ON DELETE CASCADE
);

COMMIT;


CREATE TABLE solicitacao_filme (
    id INT AUTO_INCREMENT PRIMARY KEY,
    filme_id INT NULL, -- NULL para novas adições, ID do filme para edições
    tipo_solicitacao ENUM('ADICIONAR', 'EDITAR', 'DELETAR') NOT NULL,
    dados_json JSON NOT NULL, -- Armazena todos os dados do formulário (titulo, sinopse, etc.)
    usuario_id INT NOT NULL, -- ID do usuário que fez a solicitação
    data_solicitacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('PENDENTE', 'APROVADA', 'REJEITADA') DEFAULT 'PENDENTE',
    FOREIGN KEY (usuario_id) REFERENCES usuario(id),
    FOREIGN KEY (filme_id) REFERENCES filme(id)
);

CREATE TABLE solicitacoes_edicao (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tipo_acao ENUM('ADICAO', 'EDICAO', 'DELECAO') NOT NULL,
    status ENUM('PENDENTE', 'APROVADA', 'REJEITADA') NOT NULL DEFAULT 'PENDENTE',
    filme_id INT NULL, 
    usuario_id INT NOT NULL,
    dados_propostos TEXT NOT NULL, 
    data_solicitacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (filme_id) REFERENCES filme(id) ON DELETE SET NULL,
    FOREIGN KEY (usuario_id) REFERENCES usuario(id) ON DELETE CASCADE
);

-- Inserir gêneros
INSERT INTO genero (nome) VALUES
('Ficção'),
('Ação'),
('Drama'),
('Terror'),
('Fantasia'),
('Animação'),
('Aventura'),
('Comédia'),
('Romance'),
('Suspense'), 
('Super-herói'),
('Distopia'),
('Musical'),
('Crime'),
('Esporte'), 
('Infantil');

-- Inserir diretores
INSERT INTO diretor (nome) VALUES
('James Francis Cameron'),
('Bryan Singer'),
('Chad Stahelski'),
('Chris Columbus'),
('Coralie Fargeat'),
('Scott Derrickson'),
('Christopher Nolan'),
('Neil Burger'),
('Ryan Coogler'),
('Rawson Marshall Thurber'),
('Todd Phillips'),
('Matt Reeves'),
('Catherine Hardwicke'),
('Jon M. Chu'),
('James Gunn'),
('Jake Schreier'),
('Joseph Kosinski'),
('Zachary Cregger'),
('Bong Joon-ho'),
('Francis Lawrence'),
('Wes Ball'),
('George Walton Lucas'),
('Denis Villeneuve'),
('Manoj Nelliattu Shyamalan'),
('Christian Ditter'),
('Greta Gerwig'),
('John Lasseter'),
('Byron Howard'), 
('Chris Renaud'),
('Tim Johnson'),
('John Musker'),
('Enrico Casarosa'),
('Andrew Stanton'),
('Peter Sohn'),
('Pete Docter'),
('Tom McGrath'),
('Mark Osborne'),
('Brad Bird'),
('Carlos Saldanha'),
('Rich Moore'),
('Don Hall'),
('Kirk DeMicco'),
('Chris Wedge');

-- Inserir produtoras
INSERT INTO produtora (nome) VALUES
('Lightstorm Entertainment'),
('Marvel Studios'),
('Starz Entertainment'),
('Warner Bros.'),
('Working Title Films'),
('Universal Pictures'),
('Summit Entertainment'),
('Netflix'),
('DC Comics'),
('Proximity Media'),
('Apple Studios'),
('Plan B Entertainment'),
('Lionsgate'),
('20th Century Studios'),
('Walt Disney Pictures'),
('Paramount Pictures'),
('Canyon Creek Films'),
('Columbia Pictures'),
('Pixar Animation Studios'),
('Illumination Entertainment'),
('DreamWorks Animation');

-- Inserir atores
INSERT INTO ator (nome, fotoAtor) VALUES
('Sam Worthington', 'https://m.media-amazon.com/images/M/MV5BODAwMTQ0Y2UtYmE0ZS00Mjc4LWExZTMtNTIzMjdmYTZlMTJkXkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg'),
('Zoë Saldaña', 'https://br.web.img3.acsta.net/pictures/19/10/17/01/24/5480352.jpg'),
('Sigourney Weaver', 'https://br.web.img2.acsta.net/c_310_420/pictures/19/10/29/23/41/0644896.jpg'),
('Jennifer Lawrence', 'https://br.web.img2.acsta.net/pictures/18/07/12/23/58/2893572.jpg'),
('Hugh Jackman', 'https://m.media-amazon.com/images/M/MV5BNDExMzIzNjk3Nl5BMl5BanBnXkFtZTcwOTE4NDU5OA@@._V1_FMjpg_UX1000_.jpg'),
('James McAvoy', 'https://m.media-amazon.com/images/M/MV5BMTQzNzIxOTYzMl5BMl5BanBnXkFtZTcwNjYxNTk1Nw@@._V1_FMjpg_UX1000_.jpg'),
('Keanu Reeves', 'https://m.media-amazon.com/images/M/MV5BNDEzOTdhNDUtY2EyMy00YTNmLWE5MjItZmRjMmQzYTRlMGRkXkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg'),
('Ian McShane', 'https://m.media-amazon.com/images/M/MV5BMmMyNDcwMDgtMmIxNC00NTcyLWIwMmItNDQzNmJjNmVhYjhhXkEyXkFqcGc@._V1_.jpg'),
('Lance Reddick', 'https://upload.wikimedia.org/wikipedia/commons/5/5b/Lance_Reddick_by_Gage_Skidmore.jpg'),
('Daniel Radcliffe', 'https://m.media-amazon.com/images/M/MV5BYzVmYjIxMzgtZWU2Ny00MjAyLTk5ZWUtZDEyMTliYjczMmIxXkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg'),
('Emma Watson', 'https://upload.wikimedia.org/wikipedia/commons/7/7f/Emma_Watson_2013.jpg'),
('Rupert Grint', 'https://br.web.img3.acsta.net/r_1280_720/pictures/23/02/03/14/49/1979024.jpg'),
('Demi Moore', 'https://m.media-amazon.com/images/M/MV5BMTc2Mjc1MDE4MV5BMl5BanBnXkFtZTcwNzAyNDczNA@@._V1_.jpg'),
('Margaret Qualley', 'https://br.web.img3.acsta.net/pictures/19/10/09/23/47/5680929.jpg'),
('Dennis Quaid', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSorNo7_i_TDUXnAzOXMgya-rDp8cs-EN_G0w&s'),
('Mason Thames', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQvx9EkCl-5rJ6AjwHPfCr5j5abJQF3orokBw&s'),
('Ethan Hawke', 'https://upload.wikimedia.org/wikipedia/commons/a/ae/Ethan_Hawke_at_Berlinale_2025-3.jpg'),
('Madeleine McGraw', 'https://m.media-amazon.com/images/M/MV5BOTMyODg2ZjgtYWIzZi00NDg4LTk5YjYtMDFkNjZkMmYwYTM1XkEyXkFqcGc@._V1_CR0,1,2399,3599_.jpg'),
('Cillian Murphy', 'https://m.media-amazon.com/images/M/MV5BNWM3NTg0NGYtNTFmYS00OWY1LTlkNTgtNzZlMWY4OGRmMmEzXkEyXkFqcGc@._V1_CR1542,983,1114,1670_FMjpg_UX1000_.jpg'),
('Florence Pugh', 'https://upload.wikimedia.org/wikipedia/commons/9/9e/Florence_Pugh_at_the_2024_Toronto_International_Film_Festival_13_%28cropped_2_%E2%80%93_color_adjusted%29.jpg'),
('Emily Blunt', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRvnHm18YZZeAVEjtauA7e0CHSrz9t3Ky9Y4A&s'),
('Shailene Woodley', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTg-P1GomCtqeC86QF2OQGeTf4HhWlTLA46rQ&s'),
('Theo James', 'https://upload.wikimedia.org/wikipedia/commons/4/4e/Theo_James_March_18%2C_2014_%28cropped%29.jpg'),
('Miles Teller', 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f8/MilesTellerTIFF2025-01.png/960px-MilesTellerTIFF2025-01.png'),
('Chadwick Boseman', 'https://br.web.img2.acsta.net/c_310_420/pictures/16/10/21/17/23/376701.jpg'),
('Michael B. Jordan', 'https://br.web.img2.acsta.net/pictures/18/08/08/18/23/1187644.jpg'),
('Danai Gurira', 'https://br.web.img2.acsta.net/c_310_420/pictures/18/09/26/21/35/5483924.jpg'),
('Gal Gadot', 'https://m.media-amazon.com/images/M/MV5BNWJmNDNiMzgtOGNlOC00MmU4LThkNjUtNTIxNmQwMzQ4NTczXkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg'),
('Dwayne Johnson', 'https://m.media-amazon.com/images/M/MV5BOWUzNzIzMzQtNzMxYi00OWRiLTlhZjEtZTRjYWVkYzI4ZjMwXkEyXkFqcGc@._V1_.jpg'),
('Ryan Reynolds', 'https://m.media-amazon.com/images/M/MV5BMzRiNDhiMDQtYWZkMS00ZjU5LTg5NzUtOTc4NzE2Yzc0ZWUwXkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg'),
('Joaquin Phoenix', 'https://m.media-amazon.com/images/M/MV5BYjFjNGYzYjEtNGE0Ny00M2IyLTk5ZmYtODE3ZGFkMzVjYmNmXkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg'),
('Lady Gaga', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTCpkYP0twEfHnhoQbSEZBTGtFxTme9LNElgQ&s'),
('Connor Storrie', 'https://m.media-amazon.com/images/M/MV5BMjVjNzcyYmQtMTE4Ny00ZTJkLTk3MjYtMzM0ZTQyM2ZlY2U5XkEyXkFqcGc@._V1_CR354,0,2788,4182_.jpg'),
('Robert Pattinson', 'https://m.media-amazon.com/images/M/MV5BNzk0MDQ5OTUxMV5BMl5BanBnXkFtZTcwMDM5ODk5Mg@@._V1_FMjpg_UX1000_.jpg'),
('Zoë Kravitz', 'https://br.web.img3.acsta.net/c_310_420/pictures/20/10/07/20/38/1264964.jpg'),
('Paul Dano', 'https://m.media-amazon.com/images/M/MV5BMjMwMzE1OTc0OF5BMl5BanBnXkFtZTcwMDU2NTg0Nw@@._V1_.jpg'),
('Kristen Stewart', 'https://m.media-amazon.com/images/M/MV5BMzczM2U3ZjctYjVjYS00OWJiLTlkMzEtNDc4ZGNjMjRjMjM1XkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg'),
('Taylor Lautner', 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/Taylor_Lautner_Comic-Con_2012.jpg/960px-Taylor_Lautner_Comic-Con_2012.jpg'),
('Hailee Steinfeld', 'https://br.web.img3.acsta.net/pictures/19/10/09/22/40/4029962.jpg'),
('Wunmi Mosaku', 'https://m.media-amazon.com/images/M/MV5BZTViMjhmNzYtZjNlYi00ZDk3LTlkODEtNGEyYjc4NjEyYWVkXkEyXkFqcGc@._V1_.jpg'),
('Cynthia Erivo', 'https://m.media-amazon.com/images/M/MV5BMTcyMTI3NzI1Nl5BMl5BanBnXkFtZTgwNjQ3Njk2NjM@._V1_FMjpg_UX1000_.jpg'),
('Ariana Grande', 'https://br.web.img3.acsta.net/c_310_420/img/7c/09/7c09a4e7cde30dacdc0b055c6e71006a.jpg'),
('Jonathan Bailey', 'https://m.media-amazon.com/images/M/MV5BNDhhZjdlZjctZjQ0OS00ODIwLWFmMTItNmQ0MzJiYTQ0MjFmXkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg'),
('David Corenswet', 'https://m.media-amazon.com/images/M/MV5BYjdiYTBmY2EtZmQxOC00ZmM1LThmMzYtMjYxYmU1M2FhMDg0XkEyXkFqcGc@._V1_.jpg'),
('Isabela Merced', 'https://br.web.img3.acsta.net/pictures/19/11/12/22/21/1026716.jpg'),
('Nicholas Hoult', 'https://image.tmdb.org/t/p/w500/laeAYQVBV9U3DkJ1B4Cn1XhpT8P.jpg'),
('David Harbour', 'https://m.media-amazon.com/images/M/MV5BZjVkZmNiZGYtZTU3Mi00YzhhLWI1NzQtOTIyNWVmN2IwMjg2XkEyXkFqcGc@._V1_.jpg'),
('Sebastian Stan', 'https://m.media-amazon.com/images/M/MV5BMWEwYjgxMDQtYmRkOS00MGFiLThjMzMtZGQ2ZjBhMTcyOWNlXkEyXkFqcGc@._V1_.jpg'),
('Brad Pitt', 'https://br.web.img2.acsta.net/pictures/19/03/19/17/23/0985270.jpg'),
('Simone Ashley', 'https://m.media-amazon.com/images/M/MV5BYjQwYTk3ZWUtNWI4OC00YzYzLWFlZjAtNWFhZmQ0MTgzMWJmXkEyXkFqcGc@._V1_.jpg'),
('Damson Idris', 'https://c.files.bbci.co.uk/5748/live/91722510-5363-11f0-a0b2-13bcfa16c1d6.jpg'),
('Austin Abrams', 'https://br.web.img3.acsta.net/pictures/19/09/03/22/34/3788663.jpg'), 
('Amy Madigan', 'https://m.media-amazon.com/images/M/MV5BM2UyYWQ0OTMtZjU2OC00MzE3LTgxYTAtZmQ2YzM4NTI4OGZjXkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg'),
('Benedict Wong', 'https://image.tmdb.org/t/p/w500/yYfLyrC2CE6vBWSJfkpuVKL2POM.jpg'),
('Mark Ruffalo', 'https://m.media-amazon.com/images/M/MV5BM2JiYzA0ZGItNmFhYy00MjIyLWEwN2QtMzRmNDUyNjNiZjBiXkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg'),
('Steven Yeun', 'https://m.media-amazon.com/images/M/MV5BZTdkZDYwNzQtNmJhOC00NGRkLWJmOTgtZDM1NGE0ZDFmYTdmXkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg'),
('Josh Hutcherson', 'https://m.media-amazon.com/images/M/MV5BYzRjMjU3NjUtOTc3Zi00M2I5LThmZWEtZGUwZTA0Njc4Mzk2XkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg'),
('Liam Hemsworth', 'https://m.media-amazon.com/images/M/MV5BYzZhNjVhYzYtODgxZi00MjdmLTk4ZWYtNTA4ZWZmNGY4MzQ3XkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg'),
('Dylan OBrien', 'https://br.web.img3.acsta.net/pictures/18/07/05/00/33/5494215.jpg'),
('Thomas Brodie-Sangster', 'https://m.media-amazon.com/images/M/MV5BMTM4OTUyMzY0OV5BMl5BanBnXkFtZTcwMTEyMTUwOA@@._V1_.jpg'),
('Kaya Scodelario', 'https://upload.wikimedia.org/wikipedia/commons/6/63/Kaya_Scodelario_at_the_2025_Toronto_International_Film_Festival_%28cropped%29.jpg'),
('Natalie Portman', 'https://m.media-amazon.com/images/M/MV5BNjk1M2RmODAtMjE0Ny00N2U0LWIwNWYtZTAxMDFiMzk1MjU5XkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg'),
('Peter Mayhew', 'https://upload.wikimedia.org/wikipedia/commons/c/ce/Peter_Mayhew_2015.jpg'),
('Samuel L. Jackson', 'https://m.media-amazon.com/images/M/MV5BMTQ1NTQwMTYxNl5BMl5BanBnXkFtZTYwMjA1MzY1._V1_FMjpg_UX1000_.jpg'),
('Dave Franco', 'https://br.web.img3.acsta.net/pictures/18/09/12/17/48/3952615.jpg'),
('Matthew McConaughey', 'https://m.media-amazon.com/images/M/MV5BMTg0MDc3ODUwOV5BMl5BanBnXkFtZTcwMTk2NjY4Nw@@._V1_QL75_UX140_CR0,10,140,207_.jpg'),
('Anne Hathaway','https://br.web.img2.acsta.net/pictures/19/10/16/01/22/0121805.jpg'),
('Timothée Chalamet', 'https://upload.wikimedia.org/wikipedia/commons/a/aa/Timoth%C3%A9e_Chalamet-63541_%28cropped%29.jpg'),
('Zendaya', 'https://media.themoviedb.org/t/p/w235_and_h235_face/3WdOloHpjtjL96uVOhFRRCcYSwq.jpg'),
('Rebecca Ferguson', 'https://m.media-amazon.com/images/M/MV5BMDVlZjIzOTktYzNmZC00MjIzLTk1YTMtMzdlOTFiNzQ3ZGY0XkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg'),
('Aaron Pierre', 'https://m.media-amazon.com/images/M/MV5BNmQ3MmNhNTItOTVhMi00YWNhLTkwZjUtMDliMGM1YWRkNGJjXkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg'),
('Thomasin McKenzie', 'https://m.media-amazon.com/images/M/MV5BNmM5ZjA1OWUtOWNiMi00M2ZiLWIyNjEtYzQ4ODE3MGQ3MjdiXkEyXkFqcGc@._V1_.jpg'),
('Alex Wolff', 'https://br.web.img2.acsta.net/pictures/19/11/13/11/36/3878971.jpg'),
('Lily Collins', 'https://ntvb.tmsimg.com/assets/assets/552822_v9_bc.jpg?w=360&h=480'),
('Sam Claflin', 'https://m.media-amazon.com/images/M/MV5BYWZmNGUyMDEtZGUyZS00ODY3LTg4NjMtNjFiZTVjMGQyNTRlXkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg'),
('Christian Cooke', 'https://m.media-amazon.com/images/M/MV5BNzIwMDkxNDQ0OV5BMl5BanBnXkFtZTgwODIyNzE0MDI@._V1_.jpg'),
('Saoirse Ronan', 'https://m.media-amazon.com/images/M/MV5BMjExNTM5NDE4NV5BMl5BanBnXkFtZTcwNzczMzEzOQ@@._V1_FMjpg_UX1000_.jpg'),
('Owen Wilson', 'https://m.media-amazon.com/images/M/MV5BMTgwMzQ4ODYxMV5BMl5BanBnXkFtZTcwNDAwMTc2NQ@@._V1_FMjpg_UX1000_.jpg'),
('Bonnie Hunt', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSqJ2uBjulvre0laaWPhOQGkJeOjJTPEQkHQA&s'),
('Paul Newman', 'https://br.web.img2.acsta.net/c_310_420/medias/nmedia/18/35/24/80/20511943.jpg'),
('Mandy Moore', 'https://br.web.img2.acsta.net/pictures/18/01/24/20/29/4027916.jpg'),
('Zachary Levi', 'https://m.media-amazon.com/images/M/MV5BZDdiNjEwZjctODViYy00MTc5LWJjNDUtMjFhNDM3YjgzY2I2XkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg'),
('Donna Murphy', 'https://ntvb.tmsimg.com/assets/assets/76813_v9_bc.jpg'),
('Danny DeVito', 'https://m.media-amazon.com/images/M/MV5BMTE5MjM5MzM3M15BMl5BanBnXkFtZTYwOTEzOTY0._V1_.jpg'),
('Zac Efron', 'https://m.media-amazon.com/images/M/MV5BMTUxNzY3NzYwOV5BMl5BanBnXkFtZTgwNzQ3Mzc4MTI@._V1_.jpg'),
('Taylor Swift', 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Taylor_Swift_at_the_Golden_Globes_2024_%28Enhanced%2C_cropped%29_1.jpg/330px-Taylor_Swift_at_the_Golden_Globes_2024_%28Enhanced%2C_cropped%29_1.jpg'),
('Tim Allen', 'https://upload.wikimedia.org/wikipedia/commons/4/4e/Tim_Allen_2012.jpg'),
('Wallace Shawn', 'https://m.media-amazon.com/images/M/MV5BMTc3MDYzMDQ1OF5BMl5BanBnXkFtZTcwMDQ3OTc1MQ@@._V1_QL75_UY207_CR3,0,140,207_.jpg'),
('Tom Hanks', 'https://m.media-amazon.com/images/M/MV5BMTQ2MjMwNDA3Nl5BMl5BanBnXkFtZTcwMTA2NDY3NQ@@._V1_FMjpg_UX1000_.jpg'),
('Rihanna', 'https://br.web.img2.acsta.net/pictures/18/09/17/22/41/1680893.jpg'),
('Jim Parsons', 'https://m.media-amazon.com/images/M/MV5BMTg1MTkxODgzMF5BMl5BanBnXkFtZTgwMjExMjgyNzM@._V1_.jpg'),
('Jennifer Lopez', 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Jennifer_Lopez_at_the_2025_Sundance_Film_Festival_%28cropped_3%29.jpg/960px-Jennifer_Lopez_at_the_2025_Sundance_Film_Festival_%28cropped_3%29.jpg'),
('Auli i Cravalho', 'https://br.web.img3.acsta.net/pictures/19/03/12/00/26/0962796.jpg'),
('Jemaine Clement', 'https://m.media-amazon.com/images/M/MV5BMjE4ODY4Njc5N15BMl5BanBnXkFtZTcwMjk1ODIyMw@@._V1_FMjpg_UX1000_.jpg'), 
('Jacob Tremblay', 'https://m.media-amazon.com/images/M/MV5BY2M3ZTQzMGEtMjNmMy00NWZjLTkxNWQtMWM1NmQyODdiN2RjXkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg'),
('Jack Dylan Grazer', 'https://m.media-amazon.com/images/M/MV5BNjA4M2MxN2QtYTBkOC00NmY4LWI2ZTMtMGY5ZTE2ZjBiOWFjXkEyXkFqcGc@._V1_.jpg'),
('Emma Berman', 'https://m.media-amazon.com/images/M/MV5BMDBlNjBhMTMtYTU1NS00Yzg1LWEwMTktNDQ2YWM5MGRlZWRjXkEyXkFqcGc@._V1_.jpg'),
('Andrew Stanton', 'https://m.media-amazon.com/images/M/MV5BMmZiOTE4NDktMmZjNi00MzcwLWJjMzAtYWVlZDUwNjhiMGIwXkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg'),
('Ellen DeGeneres', 'https://br.web.img3.acsta.net/c_310_420/pictures/19/11/06/22/04/1180721.jpg'),
('Leah Lewis', 'https://br.web.img3.acsta.net/c_310_420/pictures/19/05/18/01/26/4360766.jpg'),
('Mamoudou Athie', 'https://m.media-amazon.com/images/M/MV5BZTM0YjNjOGEtNGNmMC00Y2Q2LWIzZjEtNGViYzk2YmVjYTkwXkEyXkFqcGc@._V1_.jpg'),
('Ronaldo Del Carmen', 'https://br.web.img3.acsta.net/c_310_420/medias/nmedia/18/71/48/08/19204733.jpg'),
('Billy Crystal', 'https://m.media-amazon.com/images/M/MV5BMTQ4MjA4MjM4NV5BMl5BanBnXkFtZTcwMzE0MjcxNQ@@._V1_FMjpg_UX1000_.jpg'),
('John Goodman', 'https://m.media-amazon.com/images/M/MV5BOTk1MzAzMDUxMF5BMl5BanBnXkFtZTgwODgyMTQxNjM@._V1_.jpg'),
('Pete Docter', 'https://m.media-amazon.com/images/M/MV5BYjAxOTRhYjUtYjQ1MS00MzUxLWExNGYtMmFhNTU4NTBkYjJiXkEyXkFqcGc@._V1_.jpg'),
('Amy Poehler', 'https://m.media-amazon.com/images/M/MV5BYTkyYTcwNjgtYzAzYi00YzNmLWExNDMtZTExMjExZTlkOTE4XkEyXkFqcGc@._V1_.jpg'),
('Mindy Kaling', 'https://m.media-amazon.com/images/M/MV5BNzQ2OTUzNDU1MF5BMl5BanBnXkFtZTcwODQ2MTYyNw@@._V1_FMjpg_UX1000_.jpg'),
('Bill Hader', 'https://m.media-amazon.com/images/M/MV5BNTY3MzgwMjE3N15BMl5BanBnXkFtZTcwNjc2MjE3NA@@._V1_FMjpg_UX1000_.jpg'),
('Shakira', 'https://upload.wikimedia.org/wikipedia/commons/b/b8/2023-11-16_Gala_de_los_Latin_Grammy%2C_03_%28cropped%2902.jpg'),
('Octavia Spencer', 'https://br.web.img3.acsta.net/pictures/19/10/31/16/20/0549057.jpg'),
('Chris Rock', 'https://m.media-amazon.com/images/M/MV5BMTEyNjM5MjgyNzdeQTJeQWpwZ15BbWU3MDAzMzUyODc@._V1_.jpg'),
('Ben Stiller', 'https://m.media-amazon.com/images/M/MV5BMjc4NDc3NDkzMl5BMl5BanBnXkFtZTcwMTAyNTQwMw@@._V1_FMjpg_UX1000_.jpg'),
('David Schwimmer', 'https://br.web.img3.acsta.net/c_310_420/pictures/18/08/16/23/30/3227780.jpg'),
('Jackie Chan', 'https://m.media-amazon.com/images/M/MV5BMTk4MDM0MDUzM15BMl5BanBnXkFtZTcwOTI4MzU1Mw@@._V1_FMjpg_UX1000_.jpg'),
('Jack Black', 'https://m.media-amazon.com/images/M/MV5BNjY3OTQwMDctY2M2Ni00OGE2LThiNjMtYjg0MDg3YjVjN2FiXkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg'),
('Angelina Jolie', 'https://br.web.img3.acsta.net/pictures/19/10/15/22/20/5747748.jpg'),
('Peter Sohn', 'https://br.web.img2.acsta.net/c_310_420/pictures/23/06/06/20/29/1903398.jpg'),
('Raymond Ochoa', 'https://m.media-amazon.com/images/M/MV5BNDRhNDQ1ZWMtNWYwZS00MmRjLWFlNjctNjNiNmFkNzVjMmZmXkEyXkFqcGc@._V1_.jpg'),
('Jack Bright', 'https://m.media-amazon.com/images/M/MV5BMTg1OTY2NDQwOF5BMl5BanBnXkFtZTgwMTU3NzkyNzE@._V1_.jpg'),
('Stephanie Beatriz', 'https://whatsondisneyplus.b-cdn.net/wp-content/uploads/2020/12/RosaS5.jpg'),
('Jessica Darrow', 'https://m.media-amazon.com/images/M/MV5BZjI2NWI0YTEtNzA5Yi00ZmIzLWJmNGYtM2IyMjIzNzQ4NzdjXkEyXkFqcGc@._V1_.jpg'),
('Diane Guerrero', 'https://br.web.img2.acsta.net/c_310_420/pictures/19/12/19/23/44/0483063.jpg'),
('Jesse Eisenberg', 'https://m.media-amazon.com/images/M/MV5BNTE3MzQzODE3OV5BMl5BanBnXkFtZTcwMDE0ODY1NA@@._V1_FMjpg_UX1000_.jpg'),
('Bruno Mars', 'https://m.media-amazon.com/images/M/MV5BMjE1NDE3ODA0MV5BMl5BanBnXkFtZTcwODQ5NTgwNQ@@._V1_.jpg'),
('Ed ONeill', 'https://m.media-amazon.com/images/M/MV5BNTI2NjcyODk0NV5BMl5BanBnXkFtZTgwNTMxODc4NzE@._V1_FMjpg_UX1000_.jpg'),
('John C. Reilly', 'https://m.media-amazon.com/images/M/MV5BMTc4MDEzMDkzOF5BMl5BanBnXkFtZTYwNzQzNzcy._V1_FMjpg_UX1000_.jpg'),
('Ryan Potter', 'https://static.wikia.nocookie.net/disney/images/2/27/Ryan_Potter.jpg/revision/latest?cb=20200223003454&path-prefix=pt-br'),
('Scott Adsit', 'https://static.wikia.nocookie.net/bighero6/images/e/e4/Scott_Adsit.jpg/revision/latest/thumbnail/width/360/height/450?cb=20170429193552'),
('Maya Rudolph', 'https://m.media-amazon.com/images/M/MV5BMTMzOTQwMzAyOF5BMl5BanBnXkFtZTYwNzA1OTc0._V1_FMjpg_UX1000_.jpg'),
('Lou Romano', 'https://m.media-amazon.com/images/M/MV5BMzU2MzM5NDA0M15BMl5BanBnXkFtZTcwMzMxNjUwOA@@._V1_FMjpg_UX1000_.jpg'),
('Nicolas Cage', 'https://m.media-amazon.com/images/M/MV5BMjUxMjE4MTQxMF5BMl5BanBnXkFtZTcwNzc2MDM1NA@@._V1_FMjpg_UX1000_.jpg'),
('Emma Stone', 'https://m.media-amazon.com/images/M/MV5BMjI4NjM1NDkyN15BMl5BanBnXkFtZTgwODgyNTY1MjE@._V1_.jpg'),
('John Leguizamo', 'https://m.media-amazon.com/images/M/MV5BNTEyMjMxNDg5NF5BMl5BanBnXkFtZTcwNzczOTY4MQ@@._V1_FMjpg_UX1000_.jpg'),
('Ray Romano', 'https://m.media-amazon.com/images/M/MV5BMTM4NzA4ODQxNV5BMl5BanBnXkFtZTYwMDA5Mjk1._V1_FMjpg_UX1000_.jpg');


-- ============================================
-- CATEGORIAS INICIAIS
-- ============================================
INSERT INTO categoria (nome) VALUES 
('Filmes Infantis'),
('Sagas'),
('Recomendados'),
('Em Alta'),
('Top da Semana'),
('Lançamentos'),
('Baseado no que você viu');

-- ============================================
-- EXEMPLOS DE FILMES
-- ============================================

INSERT INTO filme (titulo, tempo_duracao, ano, poster, background, poster_mini, trailer, avaliacao_media) VALUES
('Avatar', 162, 2009, 'assets/imagensFilmes/avatarPoster.png', 'avatarbg.png', 'assets/imagenscardhome/avatar.png','xRCIxsy-QAw', 4.8),
('X-Men', 104, 2000, 'assets/imagensFilmes/xmenPoster.png', 'xmenbg.png', 'assets/imagenscardhome/xmen.png','VNxwlx6etXI', 4.6),
('John Wick', 101, 2014, 'assets/imagensFilmes/johnwickPoster.png', 'johnwickbg.png','assets/imagenscardhome/johnwick.png', 'C0BMx-qxsP4', 4.3),
('Harry Potter', 152, 2001, 'assets/imagensFilmes/harrypotterPoster.png', 'harrypotterbg.png', 'assets/imagenscardhome/harrypotter.png','VyHV0BRtdxo', 4.7),
('A Substância', 118, 2022, 'assets/imagensFilmes/substanciaPoster.png', 'substanciabg.png','assets/imagenscardhome/substancia.png','B_tDLs6u2E0', 3.7),
('O Telefone Preto', 102, 2022, 'assets/imagensFilmes/telefonepretoPoster.png', 'telefonepretobg.png','assets/imagenscardhome/telefonepreto.png', 'dCAbPQnFAU4', 3.9),
('Oppenheimer', 180, 2023,'assets/imagensFilmes/oppenheimer.png', 'oppeiheimerbg.png','assets/imagenscardhome/oppenheimer.png', 'F3OxA9Cz17A', 4.5),
('Divergente', 139, 2014,'assets/imagensFilmes/divergente.png', 'divergentebg.png', 'assets/imagenscardhome/divergente.png', 'ALIaNcHNcUs', 4.2),
('Pantera Negra', 134, 2018, 'assets/imagensFilmes/panteraNegra.png', 'panteranegrabg.png', NULL,'wL4a4MafSjQ', 4.5),
('Alerta Vermelho', 118, 2021, 'assets/imagensFilmes/alertaVermelho.png', 'alertavermelhobg.png', NULL,'5JQuYpBZarc', 4.6),
('Joker', 122, 2019, 'assets/imagensFilmes/joker.png', 'jokerbg.png', 'assets/imagenscardhome/jokerCatalogo.png','zAGVQLHvwOY', 4.1),
('The Batman', 155, 2022, 'assets/imagensFilmes/batman.png', 'batmanbg.png', NULL, 'mqqft2x_Aa4', 4.2),
('Crepúsculo', 122, 2008, 'assets/imagensFilmes/crepusculo.png', 'crepusculobg.png', NULL, 'nxvGVSc6Ls8', 4.5),
('Pecadores', 110, 2023, 'assets/imagensFilmes/pecadores.png', 'pecadoresbg.png', 'assets/imagenscardhome/pecadoresCatalogo.png', 'vJ3i983GZs0', 3.9),
('Wicked', 151, 2021, 'assets/imagensFilmes/wicked.png', 'wickedbg.png', 'assets/imagenscardhome/wickedCatalogo.png','2FGd4o9YeZI', 4.7),
('Superman', 143, 1978, 'assets/imagensFilmes/superman.png', 'supermanbg.png', NULL, '14qzQDMcTqM', 4.2),
('Thunderbolts', 130, 2024, 'assets/imagensFilmes/thunderbolts.png', 'thunderboltsbg.png', NULL, 'MaLy0D2FTDc', 3.7),
('F1: O Filme', 119, 2023, 'assets/imagensFilmes/F1Filme.png', 'formula1bg.png', NULL, 'ZiDphkXCZsQ', 3.5),
('A Hora do Mal', 122, 2023, 'assets/imagensFilmes/ahoradomal.png', 'ahoradomalbg.png', NULL, '_tchsUm0w_M', 3.0),
('Mickey 17', 112, 2024, 'assets/imagensFilmes/mickey17.png', 'mickey17bg.png', NULL, 'Txuvq-K8kQo', 4.0),
('Jogos Vorazes', 142, 2012, 'assets/imagensFilmes/jogosVorazes.png', 'jogosvorazesbg.png', NULL, '7HDfIssATE4', 4.8),
('Jogos Vorazes: Em Chamas', 146, 2013, 'assets/imagensFilmes/jogosVorazes2.png', 'jogosvorazes2bg.png', NULL, 'cKyrXQSsSl4', 5.0),
('Jogos Vorazes: A Esperança I', 123, 2014,'assets/imagensFilmes/jogosVorazes3.png', 'jogosvorazes3bg.png', NULL, 'CORKGv8T9jw', 4.9),
('Jogos Vorazes: A Esperança II', 137, 2015, 'assets/imagensFilmes/jogosVorazes4.png', 'jogosvorazes4bg.png', NULL, 'yeCg-5BIn3k', 4.8),
('Maze Runner: Correr ou Morrer', 113, 2014, 'assets/imagensFilmes/mazeRunner1.png', 'mazerunnnerbg.png', NULL, 'ql4epTOWdNg', 4.7),
('Maze Runner: Prova de Fogo', 130, 2015, 'assets/imagensFilmes/mazeRunner2.png', 'mazerunnner2bg.png', NULL, 'dEOVaoT14WY', 4.6),
('Maze Runner: A Cura Mortal', 142, 2018, 'assets/imagensFilmes/mazeRunner3.png', 'mazerunnner3bg.png',NULL, 'zaBEBkLVCF0', 4.4),
('Star Wars: Episódio I - A Ameaça Fantasma', 136, 1999, 'assets/imagensFilmes/starwarsI.png', 'starwars1bg.png', NULL, 'bD7bpG-zDJQ', 4.2),
('Star Wars: Episódio II - Ataque dos Clones', 142, 2002, 'assets/imagensFilmes/starwarsII.png', 'starwars2bg.png', NULL, 'CO2OLQ2kiq8', 4.1),
('Star Wars: Episódio III - A Vingança dos Sith', 140, 2005, 'assets/imagensFilmes/starwarsIII.png', 'starwars3bg.png', NULL, '5UnjrG_N8hU', 4.2),
('Star Wars: Episódio IV - Uma Nova Esperança', 121, 1977, 'assets/imagensFilmes/starwarsIV.png', 'starwars4bg.png', NULL,'vZ734NWnAHA', 4.3),
('Star Wars: Episódio V - O Império Contra-Ataca', 124, 1980, 'assets/imagensFilmes/starwarsV.png', 'starwars5bg.png', NULL, 'JNwNXF9Y6kY', 4.4),
('Star Wars: Episódio VI - O Retorno de Jedi', 131, 1983, 'assets/imagensFilmes/starwarsVI.png', 'starwars6bg.png', 'assets/imagenscardhome/starWarsCatalogo.png','7L8p7_SLzvU', 4.5),
('Star Wars: Episódio VII - O Despertar da Força', 138, 2015, 'assets/imagensFilmes/starwarsVII.png', 'starwars7bg.png', NULL,'sGbxmsDFVnE', 4.6),
('Star Wars: Episódio VIII - Os Últimos Jedi', 152, 2017,'assets/imagensFilmes/starwarsVIII.png', 'starwars8bg.png', NULL, 'Q0CbN8sfihY', 4.7),
('Star Wars: Episódio IX - A Ascensão Skywalker', 142, 2019, 'assets/imagensFilmes/starwarsIX.png', 'starwars9bg.png', NULL, '8Qn_spdM5Zg', 4.9),
('Truque de Mestre 2: O Segundo Ato', 129, 2016,'assets/imagensFilmes/truquemestre.png', NULL, 'truquemestrebg.png', 'XHQHjXijSa8', 4.5),
('Interstellar', 169, 2014, 'assets/imagensFilmes/interstellarPoster.png', 'interstellarbg.png', NULL, 'BYUZhddDbdc', 4.9),
('Duna', 155, 2021, 'assets/imagensFilmes/dunaPoster.png', 'dunabg.png', NULL, 'dnBpZuSUISQ', 4.3),
('Tempo', 108, 2021, 'assets/imagensFilmes/tempoPoster.png', 'tempobg.png', NULL, 'klBqUiUFVhw',3.6),
('Simplesmente Acontece', 102, 2014, 'assets/imagensFilmes/simplesmente.png', 'simplesmentebg.png', NULL, 'ZUqU9SQOt10', 4.7),
('Adoráveis Mulheres', 135, 2019,'assets/imagensFilmes/adoraveis.png', 'adoraveisbg.png', NULL, '7nc1GE_hnLs', 4.3);

-- Inserir filmes infantis
INSERT INTO filme (titulo, tempo_duracao, ano, poster, background, poster_mini, trailer, avaliacao_media) VALUES
('Carros', 117, 2006,'assets/imagensFilmes/carros.png', 'carrosbg.png', 'assets/imagensKids/carros.png', '0I1x9ew1OZU', 4.8),
('Enrolados', 100, 2010,'assets/imagensFilmes/enrolados.png', 'enroladosbg.png', 'assets/imagensKids/enrolados.png','MXCqOhoO8mI',4.5),
('Lorax', 86, 2012,'assets/imagensFilmes/lorax.png', 'loraxbg.png','assets/imagensKids/lorax.png', 'vJCa-yNpizY', 4.8),
('Toy Story', 81, 1995, 'assets/imagensFilmes/toystory.png', 'toystorybg.png', 'assets/imagensKids/toyStory.png','guuITAMh2eo', 4.9),
('Home', 94, 2015, 'assets/imagensFilmes/home.png', 'homebg.png', NULL, 'zb-N2mdVfQ8', 4.6),
('Moana', 107, 2016, 'assets/imagensFilmes/moana.png', 'moanabg.png', NULL, 'LKFuXETZUsI', 4.3),
('Luca', 95, 2021,'assets/imagensFilmes/luca.png', 'lucabg.png', NULL,'E7_4ZUpyoWM', 4.0),
('Procurando Dory', 97, 2016, 'assets/imagensFilmes/dory.png', 'procurandodorybg.png', NULL,'JhvrQeY3doI', 4.5),
('Elementos', 107, 2023,'assets/imagensFilmes/elementos.png', 'elementosbg.png', NULL,'BydjQP2aFd0', 4.2),
('Monstros S.A.', 92, 2001, 'assets/imagensFilmes/monstrosSA.png', 'monstrosbg.png', NULL,'iRh2kF-1X2E', 4.9),
('Divertidamente', 95, 2015,'assets/imagensFilmes/divertidamente.png', 'divertidamentebg.png', NULL,'yRUAzGQ3nSY', 4.2),
('Zootopia', 108, 2016, 'assets/imagensFilmes/zootopia.png', 'zootopiabg.png', NULL,'ljBuf7PI0zM', 4.5),
('Madagascar', 86, 2005,'assets/imagensFilmes/madagascar.png', 'madagascarbg.png', NULL,'orAqhC-Hp_o', 4.7),
('Kung Fu Panda', 92, 2008, 'assets/imagensFilmes/kungfupanda.png', 'kungfubg.png', NULL,'NRc-ze7Wrxw', 4.6),
('O Bom Dinossauro', 93, 2015, 'assets/imagensFilmes/obomdinossauro.png', 'obomdinossaurobg.png', NULL, 'daFnEiLEx70', 4.2),
('Os Incríveis', 115, 2004,'assets/imagensFilmes/osincriveis.png', 'osincriveisbg.png', NULL, '-UaGUdNJdRQ', 4.5),
('Encanto', 102, 2021,'assets/imagensFilmes/encanto.png', 'encantobg.png', NULL, 'zRMicKd9IH8', 4.7),
('Rio 2', 101, 2014, 'assets/imagensFilmes/rio.png', 'rio2bg.png', NULL,'_QNrbbGpLrc', 3.9),
('Detona Ralph', 108, 2012,'assets/imagensFilmes/detonaralph.png', 'detonaralphbg.png', NULL, '87E6N7ToCxs', 4.5),
('Big Hero 6', 102, 2014, 'assets/imagensFilmes/bighero.png', 'bigherobg.png', NULL, 'z3biFxZIJOQ', 4.7),
('Ratatouille', 111, 2007, 'assets/imagensFilmes/ratatouille.png', 'ratatouillebg.png', NULL, 'NgsQ8mVkN8w', 4.5),
('Os Croods', 98, 2013, 'assets/imagensFilmes/oscroods.png', 'croodsbg.png', NULL, 'nPvii8SM3U', 3.7),
('A Era do Gelo', 81, 2002,'assets/imagensFilmes/aeradogelo.png', 'eradogelobg.png', NULL, 'y6OxYJxcjaA', 4.2);



UPDATE filme 
SET sinopse = 'No exuberante mundo alienígena de Pandora vivem os Navi, seres que parecem ser primitivos, mas são altamente evoluídos. Como o ambiente do planeta é tóxico, foram criados os avatares, corpos biológicos controlados pela mente humana que se movimentam livremente em Pandora. Jake Sully, um ex-fuzileiro naval paralítico, volta a andar através de um avatar e se apaixona por uma Navi. Esta paixão leva Jake a lutar pela sobrevivência de Pandora.' 
WHERE id = 1;

UPDATE filme 
SET sinopse = 'No futuro, os mutantes são caçados impiedosamente pelos Sentinelas, gigantescos robôs criados por Bolívar Trask . Os poucos sobreviventes precisam viver escondidos, caso contrário serão também mortos. Entre eles estão o professor Charles Xavier, Magneto, Tempestade, Kitty Pryde  e Wolverine, que buscam um meio de evitar que os mutantes sejam aniquilados. O meio encontrado é enviar a consciência de Wolverine em uma viagem no tempo, rumo aos anos 1970. Lá ela ocupa o corpo do Wolverine da época, que procura os ainda jovens Xavier e Magneto para que, juntos, impeçam que este futuro trágico para os mutantes se torne realidade.' 
WHERE id = 2;

UPDATE filme 
SET sinopse = 'John Wick (Keanu Reeves) já foi um dos assassinos mais temidos da cidade de Nova York, trabalhando em parceria com a máfia russa. Um dia, ele decide se aposentar, e neste período tem que lidar com a triste morte de sua esposa. Vítima de uma doença grave, ela já previa a sua própria morte, e deu de presente ao marido um cachorro para cuidar em seu período de luto. No entanto, poucos dias após o funeral, o cachorro é morto por ladrões que roubam o seu carro. John Wick parte em busca de vingança contra estes homens que ele já conhecia muito bem, e que roubaram o último símbolo da mulher que ele amava.' 
WHERE id = 3;

UPDATE filme 
SET sinopse = 'Harry Potter é um garoto órfão que vive infeliz com seus tios, os Dursleys. Ele recebe uma carta contendo um convite para ingressar em Hogwarts, uma famosa escola especializada em formar jovens bruxos. Inicialmente, Harry é impedido de ler a carta por seu tio, mas logo recebe a visita de Hagrid, o guarda-caça de Hogwarts, que chega para levá-lo até a escola. Harry adentra um mundo mágico que jamais imaginara, vivendo diversas aventuras com seus novos amigos, Rony Weasley e Hermione Granger.' 
WHERE id = 4;

UPDATE filme 
SET sinopse = 'Em A Substância, Elisabeth Sparkle (Demi Moore) é uma celebridade em declínio que enfrenta uma reviravolta inesperada ao ser demitida de seu programa fitness na televisão. Desesperada por um novo começo, ela decide experimentar uma droga do mercado clandestino que promete replicar suas células, criando temporariamente uma versão mais jovem e aprimorada de si mesma.' 
WHERE id = 5;

UPDATE filme 
SET sinopse = 'Em O Telefone Preto, em 1978, uma série de sequestros estão acontecendo na cidade de Denver. Ethan Hawke interpreta o "Grabbler", um serial killer que tem seu alvo crianças do bairro. Finney Shaw, um garoto de 13 anos, é sequestrado. o garoto acorda em um porão, onde há apenas uma cama e um telefone preto em uma das paredes. Quando o aparelho toca, o garoto consegue ouvir a voz das vítimas anteriores do assassino, e elas tentam evitar que o Finney sofra o mesmo destino. Enquanto isso, sua irmã Gwen tem sonhos que indicam o lugar onde ele pode estar e corre contra o tempo para tentar ajudar os detetives Wright e Miller a ajudar o irmão, apenas para que isso seja em vão. Finney continua a fazer tentativas para escapar que apenas falham, até que uma das vítimas do serial killler fala sobre um plano que finalmente poderia levar Finney à liberdade.'
WHERE id = 6;

UPDATE filme 
SET sinopse = 'Oppenheimer é um filme histórico de drama dirigido por Christopher Nolan e baseado no livro biográfico vencedor do Prêmio Pulitzer, Prometeu Americano: O Triunfo e a Tragédia de J. Robert Oppenheimer, escrito por Kai Bird e Martin J. Sherwin. Ambientado na Segunda Guerra Mundial, o longa acompanha a vida de J. Robert Oppenheimer (Cillian Murphy), físico teórico da Universidade da Califórnia e diretor do Laboratório de Los Alamos durante o Projeto Manhattan - que tinha a missão de projetar e construir as primeiras bombas atômicas. A trama acompanha o físico e um grupo formado por outros cientistas ao longo do processo de desenvolvimento da arma nuclear que foi responsável pelas tragédias nas cidades de Hiroshima e Nagasaki, no Japão, em 1945. '
WHERE id = 7;

UPDATE filme 
SET sinopse = 'Em um futuro distópico de Chicago, a sociedade é dividida em cinco facções baseadas em virtudes: Abnegação (altruísmo), Amizade (generosidade), Audácia (coragem), Franqueza (honestidade) e Erudição (inteligência). Quando os jovens completam 16 anos, eles passam por um teste de aptidão e escolhem a facção à qual pertencerão para o resto da vida. A protagonista, Beatrice, descobre que é "divergente" por não se encaixar em um único grupo, o que a torna perigosa para o sistema e a força a esconder sua verdadeira natureza enquanto busca respostas e luta para sobreviver. '
WHERE id = 8;

UPDATE filme 
SET sinopse = 'Após a morte do rei TChaka, TChalla retorna a Wakanda para assumir o trono e se tornar o novo Pantera Negra. Ele precisa defender seu país de um inimigo poderoso que ameaça destruir a nação, testando sua coragem como rei e como protetor de Wakanda. TChalla deve reunir aliados, incluindo a chefe de sua guarda Okoye, sua irmã Shuri, e a agente Nakia, para proteger o segredo tecnológico de Wakanda e o destino de seu povo. '
WHERE id = 9;

UPDATE filme 
SET sinopse = 'Em Alerta Vermelho, num mundo de crimes internacionais, quando a Interpol emite o alerta vermelho, o melhor investigador do FBI, John Hartley (Dwayne Johnson) entra em cena para localizar e capturar um dos criminosos mais procurados do mundo, "O Bispo" (Gal Gadot), a ladra mais bem sucedida em roubos de obras de arte do mundo inteiro e a mais procurada também. Para isso, Hartley precisará se unir com o pior dos piores, Nolan Booth (Ryan Reynolds), para se colocar em um ousado plano de assalto para capturar O Bispo. Esta grande aventura vai levar o trio ao redor do mundo, desde selvas até pistas de dança e prisão isolada, mas para isso terão que aguentar o pior de tudo constantemente um na companhia do outro. '
WHERE id = 10;

UPDATE filme 
SET sinopse = 'Vindo de uma origem familiar complicada, sua personalidade nada convencional o fez ser demitido do emprego, e, numa reação a essa e tantas outras infelicidades em sua vida, ele assumiu uma postura violenta - e se tornou o Coringa. A continuação se passa depois dos acontecimentos do filme de 2019, após ser iniciado um movimento popular contra a elite de Gotham City, revolução esta, que teve o Coringa como seu maior representante. Preso no hospital psiquiátrico de Arkham, ele acaba conhecendo Harleen "Lee" Quinzel (Lady Gaga). A curiosidade mútua acaba se transformando em paixão e obsessão e eles desenvolvem um relacionamento romântico e doentio.'
WHERE id = 11;

UPDATE filme 
SET sinopse = ' Com apenas alguns aliados de confiança - Alfred Pennyworth (Andy Serkis) e o tenente James Gordon (Jeffrey Wright) - entre a rede corrupta de funcionários e figuras importantes do distrito, o vigilante solitário se estabeleceu como a única personificação da vingança entre seus concidadãos. Durante uma de suas investigações, Bruce acaba envolvendo a si mesmo e Gordon em um jogo de gato e rato, ao investigar uma série de maquinações sádicas em uma trilha de pistas enigmáticas estabelecida pelo vilão Charada. '
WHERE id = 12;

UPDATE filme 
SET sinopse = 'Isabella Swan (Kristen Stewart) e seu pai, Charlie (Billy Burke), mudaram-se recentemente. No novo colégio ela logo conhece Edward Cullen (Robert Pattinson), um jovem admirado por todas as garotas locais e que mantém uma aura de mistério em torno de si. Eles aos poucos se apaixonam, mas Edward sabe que isto põe a vida de Isabella em risco.'
WHERE id = 13;

UPDATE filme 
SET sinopse = 'Em Pecadores, Michael B. Jordan interpreta irmãos gêmeos que voltam à sua cidade natal com o objetivo de reconstruir a vida e apagar um passado conturbado. Esses acontecimentos, porém, voltam a atormentá-los quando uma força maligna passa a persegui-los, trazendo para a superfície medos e traumas. Esse mal busca tomar conta da cidade e de todos os cidadãos, obrigando-os a lutar para sobreviver. Mais do que contornar os demônios dominadores e famintos por poder (e sangue), Smoke e Stack (Michael B. Jordan) terão que lidar com as lendas e os mitos ameaçadores que podem estar por trás desse terror. Dirigido por Ryan Coogler (mesmo realizador de Pantera Negra e Creed) numa parceria já consagrada com Michael B. Jordan, Pecadores traz um thriller intenso com elementos sobrenaturais numa história repleta de mistérios.'
WHERE id = 14;

UPDATE filme 
SET sinopse = 'Na trama, Elphaba (Cynthia Erivo) é uma jovem do Reino de Oz, mas incompreendida por causa de sua pele verde incomum e por ainda não ter descoberto seu verdadeiro poder. Sua rotina é tranquila e pouco interessante, mas ao iniciar seus estudos na Universidade de Shiz, seu destino encontra Glinda (Ariana Grande), uma jovem popular e ambiciosa, nascida em berço de ouro, que só quer garantir seus privilégios e ainda não conhece sua verdadeira alma. As duas iniciam uma inesperada amizade; no entanto, suas diferenças, como o desejo de Glinda pela popularidade e poder, e a determinação de Elphaba em permanecer fiel a si mesma, entram no caminho, o que pode perpetuar no futuro de cada uma e em como as pessoas de Oz as enxergam.'
WHERE id = 15;

UPDATE filme 
SET sinopse = 'Um herói movido pela crença e pela esperança na bondade da humanidade. Em Superman, acompanhamos a jornada do super-herói em tentar conciliar suas duas personas: sua herança extraterrestre como kryptoniano e sua vida humana, criado como Clark Kent (David Corenswet) na cidade de Smallville no Kansas. Dirigido por James Gunn, o novo filme irá reunir personagens, heróis e vilões clássicos da história de Superman, como Lex Luthor (Nicholas Hoult), Lois Lane (Rachel Brosnahan), Lanterna Verde (Nathan Fillion), Mulher-Gavião (Isabela Merced), entre outros.'
WHERE id = 16;

UPDATE filme 
SET sinopse = 'Em Thunderbolts, uma equipe de anti-heróis é recrutada para uma missão perigosa. Yelena Belova, Bucky Barnes, Guardião Vermelho, Fantasma, Treinadora e John Walker formam o grupo de desajustados e rejeitados que, pegos numa armadilha pela diretora da CIA Valentina Allegra de Fontaine, são obrigados a embarcar num plano ofensivo que os fará confrontar seus maiores traumas e cicatrizes do passado. Prontos para agir a favor de causas duvidosas, os seis parecem ser a escolha errada para lidar com os desafios de alto risco ao lado do governo. Yelena é uma ex-espiã e assassina altamente treinada pela organização criminosa russa Sala Vermelha. Guardião Vermelho era um super soldado russo que esteve ao lado de Yelena em uma de suas missões secretas nos Estados Unidos.'
WHERE id = 17;

UPDATE filme 
SET sinopse = 'Em F1, um piloto veterano de Fórmula 1 volta da aposentadoria para ser o mentor de seu jovem colega de equipe. No filme produzido pelo heptacampeão de Fórmula 1 Lewis Hamilton, depois de abandonar as pistas, o lendário piloto Sonny Hayes (Brad Pitt) é convencido a voltar a correr para apoiar Joshua Pearce (Damson Idris), o jovem novato da escuderia fictícia ApexGP. Disposto a todos os riscos, Sonny monta uma estratégia para fazer a equipe se tornar vitoriosa, para isso ele precisará do apoio da comissão técnica e de pessoas influentes do esporte, mostrando que a corrida vai muito além das curvas dos autódromos. O longa conta com a participação dos pilotos reais da F1 e foi gravado durante as corridas do GP da Inglaterra.'
WHERE id = 18;

UPDATE filme 
SET sinopse = 'A Hora do Mal acompanha o misterioso e inexplicável desaparecimento de 17 crianças de uma mesma turma, a classe da professora Gandy (Julia Garner). Numa noite qualquer, exatamente às 2h17 da madrugada, todos os alunos da sala de Gandy acordaram, fugiram de suas casas por livre e espontânea vontade e sumiram – com exceção de um único jovem, o tímido Alex Lilly. Sem nenhum sinal de arrombamento, violência ou sequestro, a cidade inteira passa a exigir respostas sobre o que pode ter acontecido naquela noite. Quem ou o que pode estar por trás deste estranho evento? Gandy vira o principal alvo do escrutínio público, já que todos os moradores do pequeno subúrbio acreditam que ela é a responsável pelo caso.'
WHERE id = 19;

UPDATE filme 
SET sinopse = 'Como parte de um grupo descartável, cada integrante é designado a tarefas perigosas, e quando morre, suas memórias são transferidas para um novo corpo, um clone que continua a missão sem interrupções. Após seis mortes, Mickey começa a perceber que sua existência não é tão simples quanto parece. Confrontado com os segredos sombrios por trás de sua repetitiva jornada, ele se vê diante de escolhas que podem abalar a ordem estabelecida e alterar o destino da missão. Uma história de sobrevivência, identidade e revolução no coração de um mundo alienígena.'
WHERE id = 20;

UPDATE filme 
SET sinopse = 'Na região antigamente conhecida como América do Norte, a Capital de Panem controla 12 distritos e os força a escolher um garoto e uma garota, conhecidos como tributos, para competir em um evento anual televisionado. Todos os cidadãos assistem aos temidos jogos, no qual os jovens lutam até a morte, de modo que apenas um saia vitorioso. A jovem Katniss Everdeen, do Distrito 12, confia na habilidade de caça e na destreza com o arco, além dos instintos aguçados, nesta competição mortal.'
WHERE id = 21;

UPDATE filme 
SET sinopse = 'Após saírem vencedores da última edição dos Jogos Vorazes, as atitudes desafiadoras de Katniss e Peeta acabam inspirando uma rebelião contra a opressiva Capital. No entanto, os dois são obrigados a participarem de uma edição especial do torneio, o Massacre Quaternário, que acontece apenas a cada 25 anos, e reúne vencedores das edições anteriores.'
WHERE id = 22;

UPDATE filme 
SET sinopse = 'Após sobreviver à temível arena dos Jogos Vorazes, Katniss Everdeen está desanimada e destruída. Depois que a Capital reduziu o Distrito 12 a destroços, ela se refugiou no Distrito 13. Peeta Mellark foi submetido a uma lavagem cerebral, e agora está sob o domínio de Snow. Então, a presidência quer que Katniss lidere uma "resistência" e mobilize a população em uma empreitada que irá colocá-la no centro da trama para desmascarar Snow.'
WHERE id = 23;

UPDATE filme 
SET sinopse = 'Em Jogos Vorazes: A Esperança - O Final, ainda se recuperando do choque de ver Peeta (Josh Hutcherson) contra si, Katniss Everdeen (Jennifer Lawrence) é enviada ao Distrito 2 pela presidente Coin (Julianne Moore). Lá ela ajuda a convencer os moradores locais a se rebelarem contra a Capital. Com todos os distritos unidos, tem início o ataque decisivo contra o presidente Snow (Donald Sutherland). Só que Katniss tem seus próprios planos para o combate e, para levá-los adiante, precisa da ajuda de Gale (Liam Hemsworth), Finnick (Sam Claflin), Cressida (Natalie Dormer), Pollux (Elder Henson) e do próprio Peeta, enviado para compôr sua equipe.'
WHERE id = 24;

UPDATE filme 
SET sinopse = 'Em um futuro apocalíptico, o jovem Thomas é escolhido para enfrentar o sistema. Ele acorda dentro de um escuro elevador em movimento e não consegue se lembrar nem de seu nome. Na comunidade isolada em que foi abandonado, Thomas conhece outros garotos que passaram pela mesma situação. Para conseguir escapar, ele precisa descobrir os sombrios segredos guardados em sua mente e correr muito.'
WHERE id = 25;

UPDATE filme 
SET sinopse = 'Depois de escapar do labirinto, Thomas e os garotos que o acompanharam em sua fuga encontram uma realidade bem diferente: a superfície da Terra foi queimada pelo Sol e eles precisam lidar com criaturas disformes chamadas Cranks.'
WHERE id = 26;

UPDATE filme 
SET sinopse = 'No terceiro filme da saga, Thomas (Dylan O Brien) embarca em uma missão para encontrar a cura para uma doença mortal e descobre que os planos da C.R.U.E.L podem trazer consequências catastróficas para a humanidade. Agora, ele tem que decidir se vai se entregar para a C.R.U.E.L e confiar na promessa da organização de que esse será seu último experimento.'
WHERE id = 27;

UPDATE filme 
SET sinopse = 'Obi-Wan e seu mentor embarcam em uma perigosa aventura na tentativa de salvar o planeta das garras de Darth Sidious. Durante a viagem, eles conhecem um habilidoso menino e decidem treiná-lo para se tornar um Jedi. Mas o tempo irá revelar que as coisas nem sempre são o que aparentam ser.'
WHERE id = 28;

UPDATE filme 
SET sinopse = 'Dez anos após o primeiro encontro, Anakin Skywalker vive um romance proibido com Padmé, enquanto Obi-Wan investiga uma tentativa de assassinato do senador e descobre um exército secreto de clones criado para tentar destruir os Jedi.'
WHERE id = 29;

UPDATE filme 
SET sinopse = 'As Guerras Clônicas estão em pleno andamento e Anakin Skywalker mantém um elo de lealdade com Palpatine, ao mesmo tempo em que luta para que seu casamento com Padmé Amidala não seja afetado por esta situação. Seduzido por promessas de poder, Anakin se aproxima cada vez mais de Darth Sidious até se tornar o temível Darth Vader. Juntos eles tramam um plano para aniquilar de uma vez por todas com os cavaleiros jedi.'
WHERE id = 30;

UPDATE filme 
SET sinopse = 'A princesa Leia é mantida refém pelas forças imperiais comandadas por Darth Vader. Luke Skywalker e o capitão Han Solo precisam libertá-la e restaurar a liberdade e a justiça na galáxia.'
WHERE id = 31;

UPDATE filme 
SET sinopse = 'Yoda treina Luke Skywalker para ser um cavaleiro Jedi. Han Solo corteja a Princesa Leia enquanto Darth Vader retorna para combater as forças rebeldes que tentam salvar a galáxia.'
WHERE id = 32;

UPDATE filme 
SET sinopse = 'Luke Skywalker e seus amigos viajam para Tatooine e salvam seu amigo Han Solo do lorde do crime Jabba o Hutt. O Império Galático começou a construção de uma segunda Estrela da Morte, visando aniquilar a Aliança Rebelde, mas seu término está comprometido pela Frota Rebelde, que insiste em dar um fim ao Império. Neste meio tempo, Luke Skywalker luta para resgatar Vader, um ex-Jedi, de volta do lado sombrio da Força.'
WHERE id = 33;

UPDATE filme 
SET sinopse = 'A queda de Darth Vader e do Império levou ao surgimento de uma nova força sombria: a Primeira Ordem. Eles procuram o jedi Luke Skywalker, desaparecido. A resistência tenta desesperadamente encontrá-lo antes para salvar a galáxia.'
WHERE id = 34;

UPDATE filme 
SET sinopse = 'A tranquila e solitária vida de Luke Skywalker sofre uma reviravolta quando ele conhece Rey, uma jovem que mostra fortes sinais da Força. O desejo dela de aprender o estilo dos Jedi força Luke a tomar uma decisão que mudará sua vida para sempre. Enquanto isso, Kylo Ren e o General Hux lideram a Primeira Ordem para um ataque total contra Leia e a Resistência pela supremacia da galáxia.'
WHERE id = 35;

UPDATE filme 
SET sinopse = 'Com o retorno do Imperador Palpatine, a Resistência toma a frente da batalha. Treinando para ser uma completa Jedi, Rey se encontra em conflito com passado e futuro, e teme pelas respostas que pode conseguir com Kylo Ren.'
WHERE id = 36;

UPDATE filme 
SET sinopse = 'Após enganarem o FBI, ilusionistas foragidos são protegidos por Dylan Rhodes, agente duplo infiltrado. Enquanto desviam da perseguição oficial, o grupo prepara seu próximo golpe: expor um gênio da tecnologia que rouba dados pessoais.'
WHERE id = 37;

UPDATE filme 
SET sinopse = 'As reservas naturais da Terra estão chegando ao fim e um grupo de astronautas recebe a missão de verificar possíveis planetas para receberem a população mundial, possibilitando a continuação da espécie. Cooper é chamado para liderar o grupo e aceita a missão sabendo que pode nunca mais ver os filhos. Ao lado de Brand, Jenkins e Doyle, ele seguirá em busca de um novo lar.'
WHERE id = 38;

UPDATE filme 
SET sinopse = 'Paul Atreides é um jovem brilhante, dono de um destino além de sua compreensão. Ele deve viajar para o planeta mais perigoso do universo para garantir o futuro de seu povo.'
WHERE id = 39;

UPDATE filme 
SET sinopse = 'Uma família decide se divertir em uma praia e se vê envolvida em um mistério sinistro. O tempo parece passar de forma diferente no lugar, fazendo com que eles envelheçam anos em alguns minutos.'
WHERE id = 40;

UPDATE filme 
SET sinopse = 'Alex e Rosie são amigos inseparáveis que cresceram juntos em Londres, compartilhando entre si suas melhores experiências. Tudo muda quando Alex ganha uma bolsa de estudos e passa a morar nos EUA. Separados, seus caminhos agora são outros. Mas nos tempos de hoje é impossível não se conectar. E, em se tratando de amor, o difícil é fazer as escolhas certas.'
WHERE id = 41;

UPDATE filme 
SET sinopse = 'As irmãs Jo (Saoirse Ronan), Beth (Eliza Scanlen), Meg (Emma Watson) e Amy (Florence Pugh) amadurecem na virada da adolescência para a vida adulta enquanto os Estados Unidos atravessam a Guerra Civil. Com personalidades completamente diferentes, elas enfrentam os desafios de crescer unidas pelo amor que nutrem umas pelas outras.'
WHERE id = 42;

UPDATE filme 
SET sinopse = 'Ao viajar para a Califórnia, o famoso carro de corridas Relâmpago McQueen se perde e vai parar em Radiator Springs, uma cidadezinha na Rota 66. Ele conhece novos amigos e aprende lições que mudam sua forma de encarar a vida.'
WHERE id = 43;

UPDATE filme 
SET sinopse = 'O bandido mais procurado do reino, Flynn Rider, se esconde em uma torre e acaba prisioneiro de Rapunzel, residente de longa data do local. Dona de cabelos dourados e mágicos com 21 metros de comprimento, ela está trancada há anos e deseja desesperadamente a liberdade. A adolescente determinada faz um acordo com o rapaz, e, juntos, partem para uma aventura emocionante.'
WHERE id = 44;

UPDATE filme 
SET sinopse = 'O filme "O Lorax: Em Busca da Trúfula Perdida" conta a história de Ted, um garoto que vive em uma cidade futurística toda artificial e sem árvores verdadeiras. Para conquistar a garota que ama, Audrey, que sonha em ver uma árvore real, Ted parte em uma aventura para fora da cidade em busca de uma semente da mítica árvore Trúfula. '
WHERE id = 45;

UPDATE filme 
SET sinopse = 'O aniversário do garoto Andy está chegando e seus brinquedos ficam nervosos, temendo que ele ganhe novos brinquedos que possam substituí-los. Liderados pelo caubói Woody, o brinquedo predileto de Andy, eles recebem Buzz Lightyear, o boneco de um patrulheiro espacial, que logo passa a receber mais atenção do garoto. Com ciúmes, Woody tenta ensiná-lo uma lição, mas Buzz cai pela janela. É o início da aventura do caubói, que precisa resgatar Buzz para limpar sua barra com os outros brinquedos.'
WHERE id = 46;

UPDATE filme 
SET sinopse = 'A Terra é invadida por uma raça alienígena em busca de um novo lar. Porém, uma esperta garota chamada Tip consegue fugir e acaba virando cúmplice de um alienígena exilado chamado Oh. Os dois fugitivos embarcam em uma grande aventura.'
WHERE id = 47;

UPDATE filme 
SET sinopse = 'Uma jovem parte em uma missão para salvar seu povo. Durante a jornada, Moana conhece o outrora poderoso semideus Maui, que a guia em sua busca para se tornar uma mestre em encontrar caminhos. Juntos, eles navegam pelo oceano em uma viagem incrível.'
WHERE id = 48;

UPDATE filme 
SET sinopse = 'Luca vive aventuras com seu novo melhor amigo, mas a diversão é ameaçada por um segredo: seu amigo é um monstro marinho de outro mundo que fica abaixo da superfície da água.'
WHERE id = 49;

UPDATE filme 
SET sinopse = 'Um ano após ajudar Marlin a reencontrar seu filho Nemo, Dory relembra sua amada família. Com saudades, decide fazer de tudo para reencontrá-los. Ela acaba esbarrando com amigos do passado e cai nas perigosas mãos dos humanos.'
WHERE id = 50;

UPDATE filme 
SET sinopse = 'Em uma cidade onde os habitantes de fogo, água, terra e ar convivem, uma jovem mulher flamejante e um rapaz que vive seguindo o fluxo descobrem algo surpreendente, porém elementar: o quanto eles têm em comum.'
WHERE id = 51;

UPDATE filme 
SET sinopse = 'A maior fábrica de monstros do mundo conta com James Sullivan, um dos monstros mais assustadores, que tem o pelo azul e chifres, além de seu assistente e melhor amigo Mike, um monstro verde de um olho só. Eles têm por missão assustar as crianças, que são consideradas tóxicas pelos monstros e cujo contato com eles seria catastrófico para seu mundo. Porém, ao visitar o mundo dos humanos a trabalho, Mike e Sully conhecem a garota Boo, que acaba sem querer indo parar no mundo dos monstros.'
WHERE id = 52;

UPDATE filme 
SET sinopse = 'Com a mudança para uma nova cidade, as emoções de Riley, que tem apenas 11 anos de idade, ficam extremamente agitadas. Uma confusão na sala de controle de seu cérebro deixa a Alegria e a Tristeza de fora, afetando a vida de Riley radicalmente.'
WHERE id = 53;

UPDATE filme 
SET sinopse = 'Em uma cidade de animais, uma raposa falante se torna uma fugitiva ao ser acusada de um crime que não cometeu. O principal policial do local, o incontestável coelho, sai em sua busca.'
WHERE id = 54;

UPDATE filme 
SET sinopse = 'Madagascar acompanha Alex, o leão, Marty, a zebra, Gloria, a hipopótama, e Melman, a girafa, que vivem no conforto do Zoológico do Central Park em Nova York. A rotina deles muda quando Marty, inspirado por seu desejo de liberdade, foge do zoológico, o que leva seus amigos a saírem em uma busca que termina com o quarteto acidentalmente enviado para a ilha de Madagascar. Lá, os animais de zoológico precisam se adaptar à vida selvagem, o que causa conflitos entre eles enquanto tentam encontrar o caminho de volta para casa. '
WHERE id = 55;

UPDATE filme 
SET sinopse = 'Po é um panda que trabalha na loja de macarrão da sua família e sonha em transformar-se em um mestre de kung fu. Seu sonho se torna realidade quando, inesperadamente, ele deve cumprir uma profecia antiga e estudar a arte marcial com seus ídolos, os Cinco Furiosos. Po precisa de toda a sabedoria, força e habilidade que conseguir reunir para proteger seu povo de um leopardo da neve malvado.'
WHERE id = 56;

UPDATE filme 
SET sinopse = 'Depois que um evento traumático perturba o animado dinossauro Arlo, ele parte em uma jornada notável. No caminho para voltar para casa, ele acaba ganhando um companheiro improvável: um menino humano chamado Spot.'
WHERE id = 57;

UPDATE filme 
SET sinopse = 'Depois do governo banir o uso de superpoderes, o maior herói do planeta, o Sr. Incrível, vive de forma pacata com sua família. Apesar de estar feliz com a vida doméstica, o Sr. Incrível ainda sente falta dos tempos em que viveu como super-herói, e sua grande chance de entrar em ação novamente surge quando um velho inimigo volta a atacar. Só que agora ele precisa contar com a ajuda de toda a família para vencer o vilão.'
WHERE id = 58;

UPDATE filme 
SET sinopse = 'Encanto da Walt Disney Animation Studios conta a história dos Madrigal, uma família extraordinária que vive escondida nas montanhas da Colômbia, em uma casa mágica, em uma cidade vibrante, em um lugar maravilhoso conhecido como um Encanto. A magia deste Encanto abençoou todos os meninos e meninas da família com um dom único, desde superforça até o poder de curar. Todos, exceto Mirabel. Mas, quando ela descobre que a magia que cerca o Encanto está em perigo, Mirabel decide que ela, a única Madrigal sem poderes mágicos, pode ser a última esperança de sua família excepcional'
WHERE id = 59;

UPDATE filme 
SET sinopse = 'As araras Blu e Jade vivem felizes com seus filhos no Rio de Janeiro. Quando seus donos, Túlio e Linda, encontram pássaros de sua espécie na Amazônia, eles decidem partir para novas aventuras na região Norte do país. Só que nem tudo é perfeito: Nigel, o velho inimigo de Blu e Jade, está de volta para se vingar.'
WHERE id = 60;

UPDATE filme 
SET sinopse = 'Ralph está cansado de ser desprezado no seu próprio jogo de fliperama. Para ganhar a atenção do herói Felix e todos os outros personagens, o vilão tem um plano e sai em busca de uma medalha, com a intenção de provar o seu valor.'
WHERE id = 61;

UPDATE filme 
SET sinopse = 'O grande robô inflável está sempre a postos para cuidar de Hiro Hamada. Quando algo devastador assola a cidade, o menino prodígio, seus amigos e o robô formam um grupo de heróis para combater o mal.'
WHERE id = 62;

UPDATE filme 
SET sinopse = 'Remy reside em Paris e possui um sofisticado paladar. Seu sonho é se tornar um chef de cozinha e desfrutar as diversas obras da arte culinária. O único problema é que ele é um rato. Quando se acha dentro de um dos restaurantes mais finos de Paris, Remy decide transformar seu sonho em realidade.'
WHERE id = 63;

UPDATE filme 
SET sinopse = 'Família da pré-história vê sua caverna ser destruída. Depois disso, os Croods partem em uma aventura em busca de um novo lugar para morar, liderados por um garoto muito imaginativo que lhes ajuda a desbravar um mundo inteiramente novo.'
WHERE id = 64;

UPDATE filme 
SET sinopse = 'Vinte mil anos atrás, num mundo coberto de gelo, o mamute Manfred e a preguiça Sid resgatam um bebê humano órfão. Agora, os dois vão enfrentar muitas aventuras até devolver o filhote de gente à sua tribo, que migrou para um novo acampamento.'
WHERE id = 65;
-- ============================================
-- EXEMPLO DE USUÁRIOS
-- ============================================
INSERT INTO usuario (nome, email, senha, tipo) VALUES
('Administrador', 'admin@filmes.com', '$2b$12$WmNYK4zAm7h7He3K.hl5IuvKYLaNmMPbv8PgzC0bxzbXLU3218mxm', 'admin'),
('Heloisa', 'heloisa@email.com', '$2b$12$GZ.gBtgPNq7RP5WiPqeefeNeUR1NnnZFsvJtUMQh9msV0eurWZYCC', 'comum');

SELECT email, tipo, senha FROM usuario WHERE tipo = 'admin';

SELECT id, nome, tipo, senha FROM usuario ;

COMMIT;
SELECT * FROM usuario;
SELECT * FROM filme;
-- ============================================
-- EXEMPLO DE FAVORITO E AVALIAÇÃO
-- ============================================

ALTER TABLE filme ADD COLUMN prioridade_simulada INT DEFAULT 999;

UPDATE filme SET prioridade_simulada = 1 WHERE id = 11;
UPDATE filme SET prioridade_simulada = 2 WHERE id = 15;
UPDATE filme SET prioridade_simulada = 3 WHERE id = 33;
UPDATE filme SET prioridade_simulada = 4 WHERE id = 14;

SELECT id, titulo, prioridade_simulada, tempo_duracao, trailer FROM filme 
WHERE prioridade_simulada <= 4 
ORDER BY prioridade_simulada ASC;

SELECT * FROM categoria;

-- Liga todos os filmes infantis à categoria "Filmes Infantis"
INSERT INTO filme_categoria (filme_id, categoria_id)
SELECT id, 1 FROM filme
WHERE titulo IN (
    'Home', 'Carros', 'Moana', 'Luca', 'Procurando Dory',
    'Enrolados', 'Lorax', 'Toy Story', 'Elementos', 'Monstros S.A.',
    'Divertidamente', 'Zootopia', 'Madagascar', 'Kung Fu Panda',
    'O Bom Dinossauro', 'Os Incríveis', 'Encanto', 'Rio 2',
    'Detona Ralph', 'Big Hero 6', 'Ratatouille', 'Os Croods', 'A Era do Gelo'
);

INSERT INTO filme_genero (filme_id, genero_id) VALUES (1, 1);
INSERT INTO filme_genero (filme_id, genero_id) VALUES (1, 7);
INSERT INTO filme_genero (filme_id, genero_id) VALUES (2, 2);
INSERT INTO filme_genero (filme_id, genero_id) VALUES (2, 5);
INSERT INTO filme_genero (filme_id, genero_id) VALUES (3, 2);
INSERT INTO filme_genero (filme_id, genero_id) VALUES (3, 3);
INSERT INTO filme_genero (filme_id, genero_id) VALUES (4, 5);
INSERT INTO filme_genero (filme_id, genero_id) VALUES (4, 7);
INSERT INTO filme_genero (filme_id, genero_id) VALUES (5, 3);
INSERT INTO filme_genero (filme_id, genero_id) VALUES (5, 4);
INSERT INTO filme_genero (filme_id, genero_id) VALUES (6, 4);
INSERT INTO filme_genero (filme_id, genero_id) VALUES (6, 10);
INSERT INTO filme_genero (filme_id, genero_id) VALUES (7, 10);
INSERT INTO filme_genero (filme_id, genero_id) VALUES (7, 3);
INSERT INTO filme_genero (filme_id, genero_id) VALUES (8, 2);
INSERT INTO filme_genero (filme_id, genero_id) VALUES (8, 12);
INSERT INTO filme_genero (filme_id, genero_id) VALUES (9, 2);
INSERT INTO filme_genero (filme_id, genero_id) VALUES (9, 11);
INSERT INTO filme_genero (filme_id, genero_id) VALUES (10, 2);
INSERT INTO filme_genero (filme_id, genero_id) VALUES (10, 8);
INSERT INTO filme_genero (filme_id, genero_id) VALUES (11, 13);
INSERT INTO filme_genero (filme_id, genero_id) VALUES (11, 14);
INSERT INTO filme_genero (filme_id, genero_id) VALUES (12, 2);
INSERT INTO filme_genero (filme_id, genero_id) VALUES (12, 14);
INSERT INTO filme_genero (filme_id, genero_id) VALUES (13, 9);
INSERT INTO filme_genero (filme_id, genero_id) VALUES (13, 5);
INSERT INTO filme_genero (filme_id, genero_id) VALUES (14, 4);
INSERT INTO filme_genero (filme_id, genero_id) VALUES (14, 2);
INSERT INTO filme_genero (filme_id, genero_id) VALUES (15, 13);
INSERT INTO filme_genero (filme_id, genero_id) VALUES (15, 5);
INSERT INTO filme_genero (filme_id, genero_id) VALUES (16, 2);
INSERT INTO filme_genero (filme_id, genero_id) VALUES (16, 1);
INSERT INTO filme_genero (filme_id, genero_id) VALUES (17, 2);
INSERT INTO filme_genero (filme_id, genero_id) VALUES (17, 1);
INSERT INTO filme_genero (filme_id, genero_id) VALUES (18, 15);
INSERT INTO filme_genero (filme_id, genero_id) VALUES (18, 2);
INSERT INTO filme_genero (filme_id, genero_id) VALUES (19, 4);
INSERT INTO filme_genero (filme_id, genero_id) VALUES (19, 10);
INSERT INTO filme_genero (filme_id, genero_id) VALUES (20, 1);
INSERT INTO filme_genero (filme_id, genero_id) VALUES (20, 8);
INSERT INTO filme_genero (filme_id, genero_id) VALUES (21, 12);
INSERT INTO filme_genero (filme_id, genero_id) VALUES (21, 2);
INSERT INTO filme_genero (filme_id, genero_id) VALUES (22, 12);
INSERT INTO filme_genero (filme_id, genero_id) VALUES (22, 2);
INSERT INTO filme_genero (filme_id, genero_id) VALUES (23, 12);
INSERT INTO filme_genero (filme_id, genero_id) VALUES (23, 2);
INSERT INTO filme_genero (filme_id, genero_id) VALUES (24, 12);
INSERT INTO filme_genero (filme_id, genero_id) VALUES (24, 2);
INSERT INTO filme_genero (filme_id, genero_id) VALUES (25, 12);
INSERT INTO filme_genero (filme_id, genero_id) VALUES (25, 2);
INSERT INTO filme_genero (filme_id, genero_id) VALUES (26, 12);
INSERT INTO filme_genero (filme_id, genero_id) VALUES (26, 2);
INSERT INTO filme_genero (filme_id, genero_id) VALUES (27, 12);
INSERT INTO filme_genero (filme_id, genero_id) VALUES (27, 2);
INSERT INTO filme_genero (filme_id, genero_id) VALUES (28, 1);
INSERT INTO filme_genero (filme_id, genero_id) VALUES (28, 7);
INSERT INTO filme_genero (filme_id, genero_id) VALUES (29, 1);
INSERT INTO filme_genero (filme_id, genero_id) VALUES (29, 7);
INSERT INTO filme_genero (filme_id, genero_id) VALUES (30, 1);
INSERT INTO filme_genero (filme_id, genero_id) VALUES (30, 7);
INSERT INTO filme_genero (filme_id, genero_id) VALUES (31, 1);
INSERT INTO filme_genero (filme_id, genero_id) VALUES (31, 7);
INSERT INTO filme_genero (filme_id, genero_id) VALUES (32, 1);
INSERT INTO filme_genero (filme_id, genero_id) VALUES (32, 7);
INSERT INTO filme_genero (filme_id, genero_id) VALUES (33, 1);
INSERT INTO filme_genero (filme_id, genero_id) VALUES (33, 7);
INSERT INTO filme_genero (filme_id, genero_id) VALUES (34, 1);
INSERT INTO filme_genero (filme_id, genero_id) VALUES (34, 7);
INSERT INTO filme_genero (filme_id, genero_id) VALUES (35, 1);
INSERT INTO filme_genero (filme_id, genero_id) VALUES (35, 7);
INSERT INTO filme_genero (filme_id, genero_id) VALUES (36, 1);
INSERT INTO filme_genero (filme_id, genero_id) VALUES (36, 7);
INSERT INTO filme_genero (filme_id, genero_id) VALUES (37, 1);
INSERT INTO filme_genero (filme_id, genero_id) VALUES (37, 7);
INSERT INTO filme_genero (filme_id, genero_id) VALUES (38, 14);
INSERT INTO filme_genero (filme_id, genero_id) VALUES (38, 8);
INSERT INTO filme_genero (filme_id, genero_id) VALUES (39, 1);
INSERT INTO filme_genero (filme_id, genero_id) VALUES (39, 3);
INSERT INTO filme_genero (filme_id, genero_id) VALUES (40, 1);
INSERT INTO filme_genero (filme_id, genero_id) VALUES (40, 7);
INSERT INTO filme_genero (filme_id, genero_id) VALUES (41, 4);
INSERT INTO filme_genero (filme_id, genero_id) VALUES (41, 1);
INSERT INTO filme_genero (filme_id, genero_id) VALUES (42, 9);
INSERT INTO filme_genero (filme_id, genero_id) VALUES (42, 3);
INSERT INTO filme_genero (filme_id, genero_id) VALUES (43, 16);
INSERT INTO filme_genero (filme_id, genero_id) VALUES (43, 2);
INSERT INTO filme_genero (filme_id, genero_id) VALUES (44, 16);
INSERT INTO filme_genero (filme_id, genero_id) VALUES (44, 9);
INSERT INTO filme_genero (filme_id, genero_id) VALUES (45, 16);
INSERT INTO filme_genero (filme_id, genero_id) VALUES (45, 5);
INSERT INTO filme_genero (filme_id, genero_id) VALUES (46, 16);
INSERT INTO filme_genero (filme_id, genero_id) VALUES (46, 7);
INSERT INTO filme_genero (filme_id, genero_id) VALUES (47, 16);
INSERT INTO filme_genero (filme_id, genero_id) VALUES (47, 1);
INSERT INTO filme_genero (filme_id, genero_id) VALUES (48, 16);
INSERT INTO filme_genero (filme_id, genero_id) VALUES (48, 7);
INSERT INTO filme_genero (filme_id, genero_id) VALUES (49, 16);
INSERT INTO filme_genero (filme_id, genero_id) VALUES (49, 5);
INSERT INTO filme_genero (filme_id, genero_id) VALUES (50, 16);
INSERT INTO filme_genero (filme_id, genero_id) VALUES (50, 8);
INSERT INTO filme_genero (filme_id, genero_id) VALUES (51, 16);
INSERT INTO filme_genero (filme_id, genero_id) VALUES (51, 5);
INSERT INTO filme_genero (filme_id, genero_id) VALUES (52, 16);
INSERT INTO filme_genero (filme_id, genero_id) VALUES (52, 8);
INSERT INTO filme_genero (filme_id, genero_id) VALUES (53, 16);
INSERT INTO filme_genero (filme_id, genero_id) VALUES (53, 8);
INSERT INTO filme_genero (filme_id, genero_id) VALUES (54, 16);
INSERT INTO filme_genero (filme_id, genero_id) VALUES (54, 2);
INSERT INTO filme_genero (filme_id, genero_id) VALUES (55, 16);
INSERT INTO filme_genero (filme_id, genero_id) VALUES (55, 8);
INSERT INTO filme_genero (filme_id, genero_id) VALUES (56, 16);
INSERT INTO filme_genero (filme_id, genero_id) VALUES (56, 2);
INSERT INTO filme_genero (filme_id, genero_id) VALUES (57, 16);
INSERT INTO filme_genero (filme_id, genero_id) VALUES (57, 8);
INSERT INTO filme_genero (filme_id, genero_id) VALUES (58, 16);
INSERT INTO filme_genero (filme_id, genero_id) VALUES (58, 11);
INSERT INTO filme_genero (filme_id, genero_id) VALUES (59, 16);
INSERT INTO filme_genero (filme_id, genero_id) VALUES (59, 13);
INSERT INTO filme_genero (filme_id, genero_id) VALUES (60, 16);
INSERT INTO filme_genero (filme_id, genero_id) VALUES (60, 13);
INSERT INTO filme_genero (filme_id, genero_id) VALUES (61, 16);
INSERT INTO filme_genero (filme_id, genero_id) VALUES (61, 7);
INSERT INTO filme_genero (filme_id, genero_id) VALUES (62, 16);
INSERT INTO filme_genero (filme_id, genero_id) VALUES (62, 11);
INSERT INTO filme_genero (filme_id, genero_id) VALUES (63, 16);
INSERT INTO filme_genero (filme_id, genero_id) VALUES (63, 8);
INSERT INTO filme_genero (filme_id, genero_id) VALUES (64, 16);
INSERT INTO filme_genero (filme_id, genero_id) VALUES (64, 8);
INSERT INTO filme_genero (filme_id, genero_id) VALUES (65, 16);
INSERT INTO filme_genero (filme_id, genero_id) VALUES (65, 7);

INSERT INTO filme_ator (filme_id, ator_id) VALUES (1, 1);
INSERT INTO filme_ator (filme_id, ator_id) VALUES (1, 2);
INSERT INTO filme_ator (filme_id, ator_id) VALUES (1, 3);
INSERT INTO filme_ator (filme_id, ator_id) VALUES (2, 4);
INSERT INTO filme_ator (filme_id, ator_id) VALUES (2, 5);
INSERT INTO filme_ator (filme_id, ator_id) VALUES (2, 6);
INSERT INTO filme_ator (filme_id, ator_id) VALUES (3, 7);
INSERT INTO filme_ator (filme_id, ator_id) VALUES (3, 8);
INSERT INTO filme_ator (filme_id, ator_id) VALUES (3, 9);
INSERT INTO filme_ator (filme_id, ator_id) VALUES (4, 10);
INSERT INTO filme_ator (filme_id, ator_id) VALUES (4, 11);
INSERT INTO filme_ator (filme_id, ator_id) VALUES (4, 12);
INSERT INTO filme_ator (filme_id, ator_id) VALUES (5, 13);
INSERT INTO filme_ator (filme_id, ator_id) VALUES (5, 14);
INSERT INTO filme_ator (filme_id, ator_id) VALUES (5, 15);
INSERT INTO filme_ator (filme_id, ator_id) VALUES (6, 16);
INSERT INTO filme_ator (filme_id, ator_id) VALUES (6, 17);
INSERT INTO filme_ator (filme_id, ator_id) VALUES (6, 18);
INSERT INTO filme_ator (filme_id, ator_id) VALUES (7, 19);
INSERT INTO filme_ator (filme_id, ator_id) VALUES (7, 20);
INSERT INTO filme_ator (filme_id, ator_id) VALUES (7, 21);
INSERT INTO filme_ator (filme_id, ator_id) VALUES (8, 22);
INSERT INTO filme_ator (filme_id, ator_id) VALUES (8, 23);
INSERT INTO filme_ator (filme_id, ator_id) VALUES (8, 24);
INSERT INTO filme_ator (filme_id, ator_id) VALUES (9, 25);
INSERT INTO filme_ator (filme_id, ator_id) VALUES (9, 26);
INSERT INTO filme_ator (filme_id, ator_id) VALUES (9, 27);
INSERT INTO filme_ator (filme_id, ator_id) VALUES (10, 28);
INSERT INTO filme_ator (filme_id, ator_id) VALUES (10, 29);
INSERT INTO filme_ator (filme_id, ator_id) VALUES (10, 30);
INSERT INTO filme_ator (filme_id, ator_id) VALUES (11, 31);
INSERT INTO filme_ator (filme_id, ator_id) VALUES (11, 32);
INSERT INTO filme_ator (filme_id, ator_id) VALUES (11, 33);
INSERT INTO filme_ator (filme_id, ator_id) VALUES (12, 34);
INSERT INTO filme_ator (filme_id, ator_id) VALUES (12, 35);
INSERT INTO filme_ator (filme_id, ator_id) VALUES (12, 36);
INSERT INTO filme_ator (filme_id, ator_id) VALUES (13, 34);
INSERT INTO filme_ator (filme_id, ator_id) VALUES (13, 37);
INSERT INTO filme_ator (filme_id, ator_id) VALUES (13, 38);
INSERT INTO filme_ator (filme_id, ator_id) VALUES (14, 26);
INSERT INTO filme_ator (filme_id, ator_id) VALUES (14, 39);
INSERT INTO filme_ator (filme_id, ator_id) VALUES (14, 40);
INSERT INTO filme_ator (filme_id, ator_id) VALUES (15, 41);
INSERT INTO filme_ator (filme_id, ator_id) VALUES (15, 42);
INSERT INTO filme_ator (filme_id, ator_id) VALUES (15, 43);
INSERT INTO filme_ator (filme_id, ator_id) VALUES (16, 44);
INSERT INTO filme_ator (filme_id, ator_id) VALUES (16, 45);
INSERT INTO filme_ator (filme_id, ator_id) VALUES (16, 46);
INSERT INTO filme_ator (filme_id, ator_id) VALUES (17, 20);
INSERT INTO filme_ator (filme_id, ator_id) VALUES (17, 47);
INSERT INTO filme_ator (filme_id, ator_id) VALUES (17, 48);
INSERT INTO filme_ator (filme_id, ator_id) VALUES (18, 49);
INSERT INTO filme_ator (filme_id, ator_id) VALUES (18, 50);
INSERT INTO filme_ator (filme_id, ator_id) VALUES (18, 51);
INSERT INTO filme_ator (filme_id, ator_id) VALUES (19, 52);
INSERT INTO filme_ator (filme_id, ator_id) VALUES (19, 53);
INSERT INTO filme_ator (filme_id, ator_id) VALUES (19, 54);
INSERT INTO filme_ator (filme_id, ator_id) VALUES (20, 34);
INSERT INTO filme_ator (filme_id, ator_id) VALUES (20, 55);
INSERT INTO filme_ator (filme_id, ator_id) VALUES (20, 56);
INSERT INTO filme_ator (filme_id, ator_id) VALUES (21, 4);
INSERT INTO filme_ator (filme_id, ator_id) VALUES (21, 57);
INSERT INTO filme_ator (filme_id, ator_id) VALUES (21, 58);
INSERT INTO filme_ator (filme_id, ator_id) VALUES (22, 4);
INSERT INTO filme_ator (filme_id, ator_id) VALUES (22, 57);
INSERT INTO filme_ator (filme_id, ator_id) VALUES (22, 58);
INSERT INTO filme_ator (filme_id, ator_id) VALUES (23, 4);
INSERT INTO filme_ator (filme_id, ator_id) VALUES (23, 57);
INSERT INTO filme_ator (filme_id, ator_id) VALUES (23, 58);
INSERT INTO filme_ator (filme_id, ator_id) VALUES (24, 4);
INSERT INTO filme_ator (filme_id, ator_id) VALUES (24, 57);
INSERT INTO filme_ator (filme_id, ator_id) VALUES (24, 58);
INSERT INTO filme_ator (filme_id, ator_id) VALUES (25, 59);
INSERT INTO filme_ator (filme_id, ator_id) VALUES (25, 60);
INSERT INTO filme_ator (filme_id, ator_id) VALUES (25, 61);
INSERT INTO filme_ator (filme_id, ator_id) VALUES (26, 59);
INSERT INTO filme_ator (filme_id, ator_id) VALUES (26, 60);
INSERT INTO filme_ator (filme_id, ator_id) VALUES (26, 61);
INSERT INTO filme_ator (filme_id, ator_id) VALUES (27, 59);
INSERT INTO filme_ator (filme_id, ator_id) VALUES (27, 60);
INSERT INTO filme_ator (filme_id, ator_id) VALUES (27, 61);
INSERT INTO filme_ator (filme_id, ator_id) VALUES (28, 62);
INSERT INTO filme_ator (filme_id, ator_id) VALUES (28, 63);
INSERT INTO filme_ator (filme_id, ator_id) VALUES (28, 64);
INSERT INTO filme_ator (filme_id, ator_id) VALUES (29, 62);
INSERT INTO filme_ator (filme_id, ator_id) VALUES (29, 63);
INSERT INTO filme_ator (filme_id, ator_id) VALUES (29, 64);
INSERT INTO filme_ator (filme_id, ator_id) VALUES (30, 62);
INSERT INTO filme_ator (filme_id, ator_id) VALUES (30, 63);
INSERT INTO filme_ator (filme_id, ator_id) VALUES (30, 64);
INSERT INTO filme_ator (filme_id, ator_id) VALUES (31, 62);
INSERT INTO filme_ator (filme_id, ator_id) VALUES (31, 63);
INSERT INTO filme_ator (filme_id, ator_id) VALUES (31, 64);
INSERT INTO filme_ator (filme_id, ator_id) VALUES (32, 62);
INSERT INTO filme_ator (filme_id, ator_id) VALUES (32, 63);
INSERT INTO filme_ator (filme_id, ator_id) VALUES (32, 64);
INSERT INTO filme_ator (filme_id, ator_id) VALUES (33, 62);
INSERT INTO filme_ator (filme_id, ator_id) VALUES (33, 63);
INSERT INTO filme_ator (filme_id, ator_id) VALUES (33, 64);
INSERT INTO filme_ator (filme_id, ator_id) VALUES (34, 62);
INSERT INTO filme_ator (filme_id, ator_id) VALUES (34, 63);
INSERT INTO filme_ator (filme_id, ator_id) VALUES (34, 64);
INSERT INTO filme_ator (filme_id, ator_id) VALUES (35, 62);
INSERT INTO filme_ator (filme_id, ator_id) VALUES (35, 63);
INSERT INTO filme_ator (filme_id, ator_id) VALUES (35, 64);
INSERT INTO filme_ator (filme_id, ator_id) VALUES (36, 62);
INSERT INTO filme_ator (filme_id, ator_id) VALUES (36, 63);
INSERT INTO filme_ator (filme_id, ator_id) VALUES (36, 64);
INSERT INTO filme_ator (filme_id, ator_id) VALUES (37, 65);
INSERT INTO filme_ator (filme_id, ator_id) VALUES (37, 55);
INSERT INTO filme_ator (filme_id, ator_id) VALUES (37, 10);
INSERT INTO filme_ator (filme_id, ator_id) VALUES (38, 66);
INSERT INTO filme_ator (filme_id, ator_id) VALUES (38, 67);
INSERT INTO filme_ator (filme_id, ator_id) VALUES (38, 68);
INSERT INTO filme_ator (filme_id, ator_id) VALUES (39, 68);
INSERT INTO filme_ator (filme_id, ator_id) VALUES (39, 69);
INSERT INTO filme_ator (filme_id, ator_id) VALUES (39, 70);
INSERT INTO filme_ator (filme_id, ator_id) VALUES (40, 71);
INSERT INTO filme_ator (filme_id, ator_id) VALUES (40, 72);
INSERT INTO filme_ator (filme_id, ator_id) VALUES (40, 73);
INSERT INTO filme_ator (filme_id, ator_id) VALUES (41, 74);
INSERT INTO filme_ator (filme_id, ator_id) VALUES (41, 75);
INSERT INTO filme_ator (filme_id, ator_id) VALUES (41, 76);
INSERT INTO filme_ator (filme_id, ator_id) VALUES (42, 11);
INSERT INTO filme_ator (filme_id, ator_id) VALUES (42, 20);
INSERT INTO filme_ator (filme_id, ator_id) VALUES (42, 77);
INSERT INTO filme_ator (filme_id, ator_id) VALUES (43, 78);
INSERT INTO filme_ator (filme_id, ator_id) VALUES (43, 79);
INSERT INTO filme_ator (filme_id, ator_id) VALUES (43, 80);
INSERT INTO filme_ator (filme_id, ator_id) VALUES (44, 81);
INSERT INTO filme_ator (filme_id, ator_id) VALUES (44, 82);
INSERT INTO filme_ator (filme_id, ator_id) VALUES (44, 83);
INSERT INTO filme_ator (filme_id, ator_id) VALUES (45, 84);
INSERT INTO filme_ator (filme_id, ator_id) VALUES (45, 85);
INSERT INTO filme_ator (filme_id, ator_id) VALUES (45, 86);
INSERT INTO filme_ator (filme_id, ator_id) VALUES (46, 87);
INSERT INTO filme_ator (filme_id, ator_id) VALUES (46, 88);
INSERT INTO filme_ator (filme_id, ator_id) VALUES (46, 89);
INSERT INTO filme_ator (filme_id, ator_id) VALUES (47, 90);
INSERT INTO filme_ator (filme_id, ator_id) VALUES (47, 91);
INSERT INTO filme_ator (filme_id, ator_id) VALUES (47, 92);
INSERT INTO filme_ator (filme_id, ator_id) VALUES (48, 29);
INSERT INTO filme_ator (filme_id, ator_id) VALUES (48, 93);
INSERT INTO filme_ator (filme_id, ator_id) VALUES (48, 94);
INSERT INTO filme_ator (filme_id, ator_id) VALUES (49, 95);
INSERT INTO filme_ator (filme_id, ator_id) VALUES (49, 96);
INSERT INTO filme_ator (filme_id, ator_id) VALUES (49, 97);
INSERT INTO filme_ator (filme_id, ator_id) VALUES (50, 98);
INSERT INTO filme_ator (filme_id, ator_id) VALUES (50, 99);
INSERT INTO filme_ator (filme_id, ator_id) VALUES (50, 3);
INSERT INTO filme_ator (filme_id, ator_id) VALUES (51, 100);
INSERT INTO filme_ator (filme_id, ator_id) VALUES (51, 101);
INSERT INTO filme_ator (filme_id, ator_id) VALUES (51, 102);
INSERT INTO filme_ator (filme_id, ator_id) VALUES (52, 103);
INSERT INTO filme_ator (filme_id, ator_id) VALUES (52, 104);
INSERT INTO filme_ator (filme_id, ator_id) VALUES (52, 105);
INSERT INTO filme_ator (filme_id, ator_id) VALUES (53, 106);
INSERT INTO filme_ator (filme_id, ator_id) VALUES (53, 107);
INSERT INTO filme_ator (filme_id, ator_id) VALUES (53, 108);
INSERT INTO filme_ator (filme_id, ator_id) VALUES (54, 109);
INSERT INTO filme_ator (filme_id, ator_id) VALUES (54, 110);
INSERT INTO filme_ator (filme_id, ator_id) VALUES (54, 79);
INSERT INTO filme_ator (filme_id, ator_id) VALUES (55, 111);
INSERT INTO filme_ator (filme_id, ator_id) VALUES (55, 112);
INSERT INTO filme_ator (filme_id, ator_id) VALUES (55, 113);
INSERT INTO filme_ator (filme_id, ator_id) VALUES (56, 114);
INSERT INTO filme_ator (filme_id, ator_id) VALUES (56, 115);
INSERT INTO filme_ator (filme_id, ator_id) VALUES (56, 116);
INSERT INTO filme_ator (filme_id, ator_id) VALUES (57, 117);
INSERT INTO filme_ator (filme_id, ator_id) VALUES (57, 118);
INSERT INTO filme_ator (filme_id, ator_id) VALUES (57, 119);
INSERT INTO filme_ator (filme_id, ator_id) VALUES (58, 117);
INSERT INTO filme_ator (filme_id, ator_id) VALUES (58, 105);
INSERT INTO filme_ator (filme_id, ator_id) VALUES (58, 64);
INSERT INTO filme_ator (filme_id, ator_id) VALUES (59, 120);
INSERT INTO filme_ator (filme_id, ator_id) VALUES (59, 121);
INSERT INTO filme_ator (filme_id, ator_id) VALUES (59, 122);
INSERT INTO filme_ator (filme_id, ator_id) VALUES (60, 67);
INSERT INTO filme_ator (filme_id, ator_id) VALUES (60, 123);
INSERT INTO filme_ator (filme_id, ator_id) VALUES (60, 124);
INSERT INTO filme_ator (filme_id, ator_id) VALUES (61, 125);
INSERT INTO filme_ator (filme_id, ator_id) VALUES (61, 126);
INSERT INTO filme_ator (filme_id, ator_id) VALUES (61, 107);
INSERT INTO filme_ator (filme_id, ator_id) VALUES (62, 127);
INSERT INTO filme_ator (filme_id, ator_id) VALUES (62, 128);
INSERT INTO filme_ator (filme_id, ator_id) VALUES (62, 129);
INSERT INTO filme_ator (filme_id, ator_id) VALUES (63, 130);
INSERT INTO filme_ator (filme_id, ator_id) VALUES (63, 117);
INSERT INTO filme_ator (filme_id, ator_id) VALUES (63, 108);
INSERT INTO filme_ator (filme_id, ator_id) VALUES (64, 131);
INSERT INTO filme_ator (filme_id, ator_id) VALUES (64, 132);
INSERT INTO filme_ator (filme_id, ator_id) VALUES (64, 30);
INSERT INTO filme_ator (filme_id, ator_id) VALUES (65, 115);
INSERT INTO filme_ator (filme_id, ator_id) VALUES (65, 133);
INSERT INTO filme_ator (filme_id, ator_id) VALUES (65, 134);

INSERT INTO filme_produtora (filme_id, produtora_id) VALUES (1, 1);
INSERT INTO filme_produtora (filme_id, produtora_id) VALUES (2, 2);
INSERT INTO filme_produtora (filme_id, produtora_id) VALUES (3, 3);
INSERT INTO filme_produtora (filme_id, produtora_id) VALUES (4, 4);
INSERT INTO filme_produtora (filme_id, produtora_id) VALUES (5, 5);
INSERT INTO filme_produtora (filme_id, produtora_id) VALUES (6, 6);
INSERT INTO filme_produtora (filme_id, produtora_id) VALUES (7, 6);
INSERT INTO filme_produtora (filme_id, produtora_id) VALUES (8, 7);
INSERT INTO filme_produtora (filme_id, produtora_id) VALUES (9, 2);
INSERT INTO filme_produtora (filme_id, produtora_id) VALUES (10, 8);
INSERT INTO filme_produtora (filme_id, produtora_id) VALUES (11, 9);
INSERT INTO filme_produtora (filme_id, produtora_id) VALUES (12, 9);
INSERT INTO filme_produtora (filme_id, produtora_id) VALUES (13, 7);
INSERT INTO filme_produtora (filme_id, produtora_id) VALUES (14, 10);
INSERT INTO filme_produtora (filme_id, produtora_id) VALUES (15, 6);
INSERT INTO filme_produtora (filme_id, produtora_id) VALUES (16, 9);
INSERT INTO filme_produtora (filme_id, produtora_id) VALUES (17, 2);
INSERT INTO filme_produtora (filme_id, produtora_id) VALUES (18, 11);
INSERT INTO filme_produtora (filme_id, produtora_id) VALUES (19, 4);
INSERT INTO filme_produtora (filme_id, produtora_id) VALUES (20, 12);
INSERT INTO filme_produtora (filme_id, produtora_id) VALUES (21, 13);
INSERT INTO filme_produtora (filme_id, produtora_id) VALUES (22, 13);
INSERT INTO filme_produtora (filme_id, produtora_id) VALUES (23, 13);
INSERT INTO filme_produtora (filme_id, produtora_id) VALUES (24, 13);
INSERT INTO filme_produtora (filme_id, produtora_id) VALUES (25, 14);
INSERT INTO filme_produtora (filme_id, produtora_id) VALUES (26, 14);
INSERT INTO filme_produtora (filme_id, produtora_id) VALUES (27, 14);
INSERT INTO filme_produtora (filme_id, produtora_id) VALUES (28, 15);
INSERT INTO filme_produtora (filme_id, produtora_id) VALUES (29, 15);
INSERT INTO filme_produtora (filme_id, produtora_id) VALUES (30, 15);
INSERT INTO filme_produtora (filme_id, produtora_id) VALUES (31, 15);
INSERT INTO filme_produtora (filme_id, produtora_id) VALUES (32, 15);
INSERT INTO filme_produtora (filme_id, produtora_id) VALUES (33, 15);
INSERT INTO filme_produtora (filme_id, produtora_id) VALUES (34, 15);
INSERT INTO filme_produtora (filme_id, produtora_id) VALUES (35, 15);
INSERT INTO filme_produtora (filme_id, produtora_id) VALUES (36, 15);
INSERT INTO filme_produtora (filme_id, produtora_id) VALUES (37, 13);
INSERT INTO filme_produtora (filme_id, produtora_id) VALUES (38, 16);
INSERT INTO filme_produtora (filme_id, produtora_id) VALUES (39, 4);
INSERT INTO filme_produtora (filme_id, produtora_id) VALUES (40, 6);
INSERT INTO filme_produtora (filme_id, produtora_id) VALUES (41, 17);
INSERT INTO filme_produtora (filme_id, produtora_id) VALUES (42, 18);
INSERT INTO filme_produtora (filme_id, produtora_id) VALUES (43, 19);
INSERT INTO filme_produtora (filme_id, produtora_id) VALUES (44, 15);
INSERT INTO filme_produtora (filme_id, produtora_id) VALUES (45, 20);
INSERT INTO filme_produtora (filme_id, produtora_id) VALUES (46, 19);
INSERT INTO filme_produtora (filme_id, produtora_id) VALUES (47, 21);
INSERT INTO filme_produtora (filme_id, produtora_id) VALUES (48, 15);
INSERT INTO filme_produtora (filme_id, produtora_id) VALUES (49, 19);
INSERT INTO filme_produtora (filme_id, produtora_id) VALUES (50, 19);
INSERT INTO filme_produtora (filme_id, produtora_id) VALUES (51, 19);
INSERT INTO filme_produtora (filme_id, produtora_id) VALUES (52, 19);
INSERT INTO filme_produtora (filme_id, produtora_id) VALUES (53, 15);
INSERT INTO filme_produtora (filme_id, produtora_id) VALUES (54, 15);
INSERT INTO filme_produtora (filme_id, produtora_id) VALUES (55, 21);
INSERT INTO filme_produtora (filme_id, produtora_id) VALUES (56, 21);
INSERT INTO filme_produtora (filme_id, produtora_id) VALUES (57, 15);
INSERT INTO filme_produtora (filme_id, produtora_id) VALUES (58, 19);
INSERT INTO filme_produtora (filme_id, produtora_id) VALUES (59, 15);
INSERT INTO filme_produtora (filme_id, produtora_id) VALUES (60, 14);
INSERT INTO filme_produtora (filme_id, produtora_id) VALUES (61, 15);
INSERT INTO filme_produtora (filme_id, produtora_id) VALUES (62, 15);
INSERT INTO filme_produtora (filme_id, produtora_id) VALUES (63, 19);
INSERT INTO filme_produtora (filme_id, produtora_id) VALUES (64, 21);
INSERT INTO filme_produtora (filme_id, produtora_id) VALUES (65, 14);

INSERT INTO filme_diretor (filme_id, diretor_id) VALUES (1, 1);
INSERT INTO filme_diretor (filme_id, diretor_id) VALUES (2, 2);
INSERT INTO filme_diretor (filme_id, diretor_id) VALUES (3, 3);
INSERT INTO filme_diretor (filme_id, diretor_id) VALUES (4, 4);
INSERT INTO filme_diretor (filme_id, diretor_id) VALUES (5, 5);
INSERT INTO filme_diretor (filme_id, diretor_id) VALUES (6, 6);
INSERT INTO filme_diretor (filme_id, diretor_id) VALUES (7, 7);
INSERT INTO filme_diretor (filme_id, diretor_id) VALUES (8, 8);
INSERT INTO filme_diretor (filme_id, diretor_id) VALUES (9, 9);
INSERT INTO filme_diretor (filme_id, diretor_id) VALUES (10, 10);
INSERT INTO filme_diretor (filme_id, diretor_id) VALUES (11, 11);
INSERT INTO filme_diretor (filme_id, diretor_id) VALUES (12, 12);
INSERT INTO filme_diretor (filme_id, diretor_id) VALUES (13, 13);
INSERT INTO filme_diretor (filme_id, diretor_id) VALUES (14, 9);
INSERT INTO filme_diretor (filme_id, diretor_id) VALUES (15, 14);
INSERT INTO filme_diretor (filme_id, diretor_id) VALUES (16, 15);
INSERT INTO filme_diretor (filme_id, diretor_id) VALUES (17, 16);
INSERT INTO filme_diretor (filme_id, diretor_id) VALUES (18, 17);
INSERT INTO filme_diretor (filme_id, diretor_id) VALUES (19, 18);
INSERT INTO filme_diretor (filme_id, diretor_id) VALUES (20, 19);
INSERT INTO filme_diretor (filme_id, diretor_id) VALUES (21, 20);
INSERT INTO filme_diretor (filme_id, diretor_id) VALUES (22, 20);
INSERT INTO filme_diretor (filme_id, diretor_id) VALUES (23, 20);
INSERT INTO filme_diretor (filme_id, diretor_id) VALUES (24, 20);
INSERT INTO filme_diretor (filme_id, diretor_id) VALUES (25, 21);
INSERT INTO filme_diretor (filme_id, diretor_id) VALUES (26, 21);
INSERT INTO filme_diretor (filme_id, diretor_id) VALUES (27, 21);
INSERT INTO filme_diretor (filme_id, diretor_id) VALUES (28, 22);
INSERT INTO filme_diretor (filme_id, diretor_id) VALUES (29, 22);
INSERT INTO filme_diretor (filme_id, diretor_id) VALUES (30, 22);
INSERT INTO filme_diretor (filme_id, diretor_id) VALUES (31, 22);
INSERT INTO filme_diretor (filme_id, diretor_id) VALUES (32, 22);
INSERT INTO filme_diretor (filme_id, diretor_id) VALUES (33, 22);
INSERT INTO filme_diretor (filme_id, diretor_id) VALUES (34, 22);
INSERT INTO filme_diretor (filme_id, diretor_id) VALUES (35, 22);
INSERT INTO filme_diretor (filme_id, diretor_id) VALUES (36, 22);
INSERT INTO filme_diretor (filme_id, diretor_id) VALUES (37, 14);
INSERT INTO filme_diretor (filme_id, diretor_id) VALUES (38, 7);
INSERT INTO filme_diretor (filme_id, diretor_id) VALUES (39, 23);
INSERT INTO filme_diretor (filme_id, diretor_id) VALUES (40, 24);
INSERT INTO filme_diretor (filme_id, diretor_id) VALUES (41, 25);
INSERT INTO filme_diretor (filme_id, diretor_id) VALUES (42, 26);
INSERT INTO filme_diretor (filme_id, diretor_id) VALUES (43, 27);
INSERT INTO filme_diretor (filme_id, diretor_id) VALUES (44, 28);
INSERT INTO filme_diretor (filme_id, diretor_id) VALUES (45, 30);
INSERT INTO filme_diretor (filme_id, diretor_id) VALUES (46, 31);
INSERT INTO filme_diretor (filme_id, diretor_id) VALUES (47, 32);
INSERT INTO filme_diretor (filme_id, diretor_id) VALUES (48, 33);
INSERT INTO filme_diretor (filme_id, diretor_id) VALUES (49, 34);
INSERT INTO filme_diretor (filme_id, diretor_id) VALUES (50, 35);
INSERT INTO filme_diretor (filme_id, diretor_id) VALUES (51, 35);
INSERT INTO filme_diretor (filme_id, diretor_id) VALUES (52, 28);
INSERT INTO filme_diretor (filme_id, diretor_id) VALUES (53, 36);
INSERT INTO filme_diretor (filme_id, diretor_id) VALUES (54, 37);
INSERT INTO filme_diretor (filme_id, diretor_id) VALUES (55, 34);
INSERT INTO filme_diretor (filme_id, diretor_id) VALUES (56, 38);
INSERT INTO filme_diretor (filme_id, diretor_id) VALUES (57, 28);
INSERT INTO filme_diretor (filme_id, diretor_id) VALUES (58, 38);
INSERT INTO filme_diretor (filme_id, diretor_id) VALUES (59, 28);
INSERT INTO filme_diretor (filme_id, diretor_id) VALUES (60, 39);
INSERT INTO filme_diretor (filme_id, diretor_id) VALUES (61, 40);
INSERT INTO filme_diretor (filme_id, diretor_id) VALUES (62, 41);
INSERT INTO filme_diretor (filme_id, diretor_id) VALUES (63, 38);
INSERT INTO filme_diretor (filme_id, diretor_id) VALUES (64, 42);
INSERT INTO filme_diretor (filme_id, diretor_id) VALUES (65, 43);

ALTER TABLE filme ADD FULLTEXT INDEX ft_titulo (titulo);