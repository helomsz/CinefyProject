import os
import json
import bcrypt
import datetime
import time
from http.server import SimpleHTTPRequestHandler, HTTPServer
from urllib.parse import urlparse, parse_qs
import mysql.connector
import mimetypes
import jwt

DB_CONFIG = {
    'host': "localhost",
    'user': "root",
    'password':"senai",
    'database': "SERVIDORFILMES"
}

def get_db_connection():
    """Tenta estabelecer uma nova conexão com o banco de dados."""
    try:
        conn = mysql.connector.connect(**DB_CONFIG)
        conn.autocommit = False 
        return conn
    except mysql.connector.Error as err:
        print(f"DEBUG: ERRO CRÍTICO ao obter conexão com MySQL: {err}")
        return None
    
SECRET_KEY = "ProjetoCinefyHeloisa"

def gerar_jwt(user_id, role):
    payload = {
        'user_id': user_id,
        'role': role,
        # Define a validade do token (usando UTC para compatibilidade com JWT)
        'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24), 
        'iat': datetime.datetime.utcnow()
    }
    # Codifica o token e garante que retorna uma string (necessário em algumas libs)
    token = jwt.encode(payload, SECRET_KEY, algorithm='HS256')
    
    # Se 'jwt.encode' retornar bytes (depende da versão/config), decodificar para string.
    if isinstance(token, bytes):
        return token.decode('utf-8')
    return token


def validar_jwt(token):
    """Decodifica e valida um token JWT, retornando o payload ou None em caso de falha."""
    try:
        # Decodifica o token usando a chave secreta e o algoritmo HS256
        payload = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
        return payload
    except jwt.ExpiredSignatureError:
        print("DEBUG: Token expirado.")
        return None
    except jwt.InvalidTokenError as e:
        print(f"DEBUG: Token inválido: {e}")
        return None

def validar_autenticacao(auth_header):
    """
    Extrai o token do cabeçalho 'Authorization' e o valida.
    Retorna o payload (dict) se válido, ou None se falhar.
    """
    if not auth_header:
        return None
    
    # Espera o formato 'Bearer <token>'
    try:
        scheme, token = auth_header.split(' ', 1)
        if scheme.lower() == 'bearer':
            return validar_jwt(token)
    except ValueError:
        pass # Formato do cabeçalho inválido
    
    return None

def decodificar_jwt(token):
    """Decodifica e valida o token, retornando o payload."""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
        return payload
    except jwt.ExpiredSignatureError:
        return {"error": "Token expirado"}
    except jwt.InvalidTokenError:
        return {"error": "Token inválido"}

def inserir_usuario(nome, sobrenome, email, senha_pura):
    """Insere um novo usuário, hasheando a senha antes de salvar."""
    meu_banco = get_db_connection()
    if not meu_banco:
        return json.dumps({"status": "erro", "mensagem": "Falha na conexão com o banco de dados."}, ensure_ascii=False)

    cursor = None
    try:
        cursor = meu_banco.cursor()
        cursor.execute("SELECT id FROM usuario WHERE email = %s", (email,))
        if cursor.fetchone():
            return json.dumps({"status": "erro", "mensagem": "Este e-mail já está cadastrado."}, ensure_ascii=False)
        bytes_senha = senha_pura.encode('utf-8')
        salt = bcrypt.gensalt()
        senha_hash_bytes = bcrypt.hashpw(bytes_senha, salt)
        senha_hash = senha_hash_bytes.decode('utf-8')


        sql = "INSERT INTO usuario (nome, sobrenome, email, senha, tipo) VALUES (%s, %s, %s, %s, 'comum')"
        valores = (nome, sobrenome, email, senha_hash)
        cursor.execute(sql, valores)
        meu_banco.commit()

        return json.dumps({"status": "sucesso", "mensagem": "Usuário cadastrado com sucesso!"}, ensure_ascii=False)

    except mysql.connector.Error as err:
        if meu_banco:
            meu_banco.rollback()
        print(f"DEBUG: Erro de banco de dados ao registrar usuário: {err}")
        return json.dumps({"status": "erro", "mensagem": f"Erro interno do banco de dados: {err}"}, ensure_ascii=False)

    finally:
        if cursor:
            cursor.close()
        if meu_banco:
            meu_banco.close()

def gerar_hash_senha(senha_pura):
    """Gera o hash bcrypt para uma senha."""
    senha_bytes = senha_pura.encode('utf-8')
    salt = bcrypt.gensalt(rounds=12) 
    return bcrypt.hashpw(senha_bytes, salt).decode('utf-8')

def autenticar_usuario(login, senha_pura):
    """Autentica o usuário, migra a senha para hash se necessário, e gera um JWT."""
    meu_banco = get_db_connection()
    if not meu_banco:
        return json.dumps({"status": "erro", "mensagem": "Falha na conexão com o banco de dados."}, ensure_ascii=False)

    cursor = None
    try:
        cursor = meu_banco.cursor()
        cursor.execute("SELECT id, nome, tipo, senha FROM usuario WHERE email = %s", (login,))
        resultado = cursor.fetchone()

        if not resultado:
            return json.dumps({"status": "erro", "mensagem": "E-mail ou senha inválidos."}, ensure_ascii=False)
        
        user_id, user_name, user_type, senha_hash_ou_pura = resultado
        
        # GARANTIR STRINGS (CORREÇÃO DEFENSIVA)
        if isinstance(user_name, bytes):
            user_name = user_name.decode('utf-8')
        if isinstance(user_type, bytes):
            user_type = user_type.decode('utf-8')
        if isinstance(senha_hash_ou_pura, bytes):
            senha_hash_ou_pura = senha_hash_ou_pura.decode('utf-8')
            
        senha_correta = False
        
        #  Tenta verificar a senha com bcrypt 
        if senha_hash_ou_pura and (senha_hash_ou_pura.startswith('$2b$') or senha_hash_ou_pura.startswith('$2a$') or senha_hash_ou_pura.startswith('$2d$')):
            try:
                # O bcrypt.checkpw requer AMBOS os valores em BYTES
                if bcrypt.checkpw(senha_pura.encode('utf-8'), senha_hash_ou_pura.encode('utf-8')):
                    senha_correta = True
            except ValueError as e:
                # Captura erros comuns do bcrypt (ex: hash corrompido ou formato inválido)
                print(f"DEBUG: Erro de bcrypt ao verificar senha: {e}")
                senha_correta = False # Se o bcrypt falhar, a senha não é correta
                
        #  Tenta verificar a senha sem hash (para migração)
        if not senha_correta and senha_hash_ou_pura == senha_pura:
            senha_correta = True
            print(f"DEBUG: Migrando senha para hash para o usuário {login}...")
        
        # LÓGICA DE VERIFICAÇÃO E MIGRAÇÃO 

        if senha_correta:

            token_jwt = gerar_jwt(user_id, user_type)
            
            #  o JSON DEVE ser serializado, pois contém apenas strings
            return json.dumps({
                "status": "sucesso",
                "mensagem": "Usuário logado",
                "token": token_jwt, 
                "user_name": user_name, 
                "user_type": user_type 
            }, ensure_ascii=False)
        else:
            return json.dumps({"status": "erro", "mensagem": "E-mail ou senha inválidos."}, ensure_ascii=False)

    except Exception as err:
        # Quando um erro ocorre na linha 163, ele cai aqui.
        print(f"DEBUG: Erro durante a autenticação. Detalhes do Erro: {repr(err)}")
        # SE O ERRO DE SERIALIZAÇÃO CONTINUAR, O ÚNICO CAMINHO É QUE O VALOR DE RETORNO DO BANCO 
        # (user_id, user_name, user_type, senha_hash_ou_pura) ESTÁ SENDO INFLUENCIADO POR UMA FALHA DE ENCODING GLOBAL.
        
        # VAMOS RETORNAR UM JSON VAZIO PARA ISOLAR A FALHA DE SERIALIZAÇÃO DA MENSAGEM DE ERRO
        try:
             # TENTA SERIALIZAR A MENSAGEM DE ERRO SIMPLES NOVAMENTE
             return json.dumps({"status": "erro", "mensagem": "Erro interno no servidor."}, ensure_ascii=False)
        except:
             # SE ATÉ ISSO FALHAR, RETORNAMOS UMA STRING SIMPLES
             return '{"status": "erro", "mensagem": "Erro de serialização crítica no servidor."}'


    finally:
        if cursor:
            cursor.close()
        if meu_banco:
            meu_banco.close()
            
            
def _inserir_relacionamento(cursor, filme_id, tabela_rel, coluna_id_rel, lista):
    """
    Insere os relacionamentos na tabela de junção.
    - lista: pode ser lista de IDs (int) ou string de nomes separados por vírgula.
    - Para nomes, a função tenta buscar o ID na tabela de referência (apenas para gêneros).
    """
    if not lista:
        return
    if isinstance(lista, str):
        lista = [item.strip() for item in lista.split(',') if item.strip()]
    elif not isinstance(lista, list):
        return

    for item in lista:
        id_relacionamento = None
        try:
            id_relacionamento = int(item)
        except (ValueError, TypeError):
            sql_busca_id = "SELECT id FROM genero WHERE nome = %s"
            cursor.execute(sql_busca_id, (item,))
            resultado = cursor.fetchone()
            if resultado:
                id_relacionamento = resultado[0]
            else:
                continue

        sql_insert_rel = f"INSERT INTO {tabela_rel} (filme_id, {coluna_id_rel}) VALUES (%s, %s)"
        cursor.execute(sql_insert_rel, (filme_id, id_relacionamento))

def inserir_filme(titulo, sinopse, tempo_duracao, ano, poster, background, trailer, avaliacao_media, generos, diretores, atores, produtoras):
    """
    Insere um novo filme e todos os seus relacionamentos (Gêneros, Diretores, Atores, Produtoras)
    em uma única transação.
    """
    meu_banco = get_db_connection()
    if not meu_banco:
        return json.dumps({"status": "erro", "mensagem": "Falha na conexão com o banco de dados."}, ensure_ascii=False)

    cursor = None
    try:
        cursor = meu_banco.cursor()

        sql_filme = """
            INSERT INTO filme 
            (titulo, sinopse, tempo_duracao, ano, poster, poster_mini, background, trailer, avaliacao_media, status) 
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
        poster_mini = poster if poster else 'default.jpg'
        valores_filme = (titulo, sinopse, tempo_duracao, ano, poster, poster_mini, background, trailer, avaliacao_media, status)
        cursor.execute(sql_filme, valores_filme)
        filme_id = cursor.lastrowid

        _inserir_relacionamento(cursor, filme_id, 'filme_genero', 'genero_id', generos)
        _inserir_relacionamento(cursor, filme_id, 'filme_diretor', 'diretor_id', diretores)
        _inserir_relacionamento(cursor, filme_id, 'filme_ator', 'ator_id', atores)
        _inserir_relacionamento(cursor, filme_id, 'filme_produtora', 'produtora_id', produtoras)
        status = 'Pendente_Adicao'

        meu_banco.commit()

        return json.dumps({"status": "sucesso", "mensagem": f"Filme '{titulo}' (ID: {filme_id}) inserido com sucesso."}, ensure_ascii=False)

    except mysql.connector.Error as err:
        if meu_banco:
            meu_banco.rollback()
        print(f"DEBUG: Erro de banco de dados ao inserir filme: {err}")
        return json.dumps({"status": "erro", "mensagem": f"Erro ao inserir filme: {err}"}, ensure_ascii=False)

    finally:
        if cursor:
            cursor.close()
        if meu_banco:
            meu_banco.close()




def listar_progresso_simulado():
    """
    Busca filmes específicos pelo título e os ordena para a seção 'Continue Assistindo' (Geral).
    Adiciona dados de progresso simulado.
    """
    meu_banco = get_db_connection()
    if not meu_banco:
        return []

    cursor = None
    try:
        cursor = meu_banco.cursor(dictionary=True)
        sql_query = """
            SELECT 
                id, 
                titulo, 
                poster_mini, 
                trailer, 
                tempo_duracao,
                f.ano
            FROM 
                filme f
            WHERE 
                f.prioridade_simulada <= 4
            ORDER BY
                f.prioridade_simulada ASC;
        """
        cursor.execute(sql_query)
        filmes_base = cursor.fetchall()

        simulacoes_progresso = [30, 14, 55, 59]
        lista_progresso_final = []

        for i, filme in enumerate(filmes_base):
            progresso_minutos = simulacoes_progresso[i] if i < len(simulacoes_progresso) else 0
            titulo_display = 'Star Wars VI' if 'Star Wars: Episódio VI' in filme['titulo'] else filme['titulo']

            lista_progresso_final.append({
                "id": filme['id'],
                "titulo": titulo_display,
                "poster_mini": filme['poster_mini'],
                "trailer": filme['trailer'],
                "progressoMinutos": progresso_minutos,
                "tempoTotalMinutos": filme['tempo_duracao']
            })

        return lista_progresso_final

    except mysql.connector.Error as err:
        print(f"DEBUG: Erro de banco de dados ao buscar progresso geral: {err}")
        return []
    finally:
        if cursor:
            cursor.close()
        if meu_banco:
            meu_banco.close()


def listar_progresso_simulado_infantil():
    """
    Busca filmes da categoria 'Filmes Infantis' e os formata para a seção 'Continue Assistindo' infantil,
    adicionando dados de progresso simulado.
    """
    meu_banco = get_db_connection()
    if not meu_banco:
        return []

    cursor = None
    try:
        cursor = meu_banco.cursor(dictionary=True)
        sql_query = """
            SELECT 
                f.id, 
                f.titulo, 
                f.poster_mini, 
                f.trailer, 
                f.tempo_duracao,
                f.ano
            FROM 
                filme f
            INNER JOIN 
                filme_categoria fc ON f.id = fc.filme_id
            INNER JOIN 
                categoria c ON fc.categoria_id = c.id AND c.nome = 'Filmes Infantis'
            ORDER BY
                f.id ASC
            LIMIT 4; -- Limita o retorno para a seção de progresso
        """
        cursor.execute(sql_query)
        filmes_base = cursor.fetchall()

        simulacoes_progresso = [5, 45, 12, 60] 
        lista_progresso_final = []

        for i, filme in enumerate(filmes_base):
            progresso_minutos = simulacoes_progresso[i] if i < len(simulacoes_progresso) else 0
            
            lista_progresso_final.append({
                "id": filme['id'],
                "titulo": filme['titulo'],
                "poster_mini": filme['poster_mini'],
                "trailer": filme['trailer'],
                "progressoMinutos": progresso_minutos,
                "tempoTotalMinutos": filme['tempo_duracao']
            })

        return lista_progresso_final

    except mysql.connector.Error as err:
        print(f"DEBUG: Erro de banco de dados ao buscar progresso infantil: {err}")
        return []
    finally:
        if cursor:
            cursor.close()
        if meu_banco:
            meu_banco.close()

def buscar_filmes_rapido(termo_busca):
    """
    Busca rápida de filmes por título para a funcionalidade de autocompletar.
    Retorna apenas ID, título e poster_mini para otimização.
    """
    if not termo_busca or len(termo_busca.strip()) < 3:
        return [] 
        
    meu_banco = get_db_connection()
    if not meu_banco:
        return []

    cursor = None
    try:
        cursor = meu_banco.cursor(dictionary=True)
        sql_query = sql_query = """
                SELECT 
                    id, 
                    titulo, 
                    ano,
                    CONCAT('http://localhost:8000/', poster) AS poster
                FROM 
                    filme 
                WHERE 
                    MATCH(titulo) AGAINST(%s IN BOOLEAN MODE)
                ORDER BY
                    id ASC
                LIMIT 10;
            """
        termo_ft = f"*{termo_busca.strip()}*" 
        valores = (termo_ft,)

        cursor.execute(sql_query, valores)
        

        filmes = cursor.fetchall()
        
        return filmes

    except mysql.connector.Error as err:
        print(f"DEBUG: Erro de banco de dados ao buscar filmes rápido: {err}")
        return []
    finally:
        if cursor:
            cursor.close()

def buscar_detalhes_filme(filme_id):
    """
    Busca todos os detalhes de um filme específico, incluindo sinopse e 
    todos os relacionamentos (Gêneros, Produtoras, Diretores, Atores).
    """
    meu_banco = get_db_connection()
    if not meu_banco:
        return None

    cursor = None
    try:
        cursor = meu_banco.cursor(dictionary=True)

        sql_query = """
            SELECT 
                f.id, 
                f.titulo, 
                f.sinopse,
                f.ano, 
                f.tempo_duracao, 
                f.poster, 
                f.background,
                f.trailer,
                f.avaliacao_media,
                GROUP_CONCAT(DISTINCT g.nome SEPARATOR ' | ') AS generos,
                GROUP_CONCAT(DISTINCT p.nome) AS produtoras, 
                GROUP_CONCAT(DISTINCT d.nome) AS diretores,
                GROUP_CONCAT(DISTINCT a.nome) AS atores,
                
                -- LINHA CORRIGIDA: Usa MOD() no lugar de % para evitar erro de sintaxe
                CONCAT(f.tempo_duracao DIV 60, 'h ', MOD(f.tempo_duracao, 60), 'm') AS duracao_formatada 
                
            FROM filme f
            LEFT JOIN filme_genero fg ON f.id = fg.filme_id
            LEFT JOIN genero g ON fg.genero_id = g.id
            LEFT JOIN filme_produtora fp ON f.id = fp.filme_id
            LEFT JOIN produtora p ON fp.produtora_id = p.id
            LEFT JOIN filme_diretor fd ON f.id = fd.filme_id
            LEFT JOIN diretor d ON fd.diretor_id = d.id
            LEFT JOIN filme_ator fa ON f.id = fa.filme_id
            LEFT JOIN ator a ON fa.ator_id = a.id
            WHERE 
                f.id = %s
            GROUP BY f.id
            LIMIT 1;
        """
        cursor.execute(sql_query, (filme_id,))
        filme = cursor.fetchone()

        if filme:
            elenco = buscar_elenco_filme(filme_id)
            filme['elenco_completo'] = elenco
            base_url_assets = "http://localhost:8000/assets/imagensFilmes/"

            if filme['poster']:
                caminho_limpo = filme['poster'].split('/')[-1] 
                filme['poster'] = base_url_assets + caminho_limpo

            if filme['background']:
                filme['background'] = base_url_assets + filme['background']

            return filme
        return None

    except mysql.connector.Error as err:
        print(f"DEBUG: Erro de banco de dados ao buscar detalhes do filme ID {filme_id}: {err}")
        return None

    finally:
        if cursor:
            cursor.close()
        if meu_banco:
            meu_banco.close()
def buscar_elenco_filme(filme_id):
    meu_banco = get_db_connection()
    if not meu_banco:
        return []
    cursor = None
    try:
        cursor = meu_banco.cursor(dictionary=True)
        sql_query = """
            SELECT 
                a.nome, 
                a.fotoAtor 
            FROM ator a
            JOIN filme_ator fa ON a.id = fa.ator_id
            WHERE fa.filme_id = %s
        """
        cursor.execute(sql_query, (filme_id,))
        elenco = cursor.fetchall()
        return elenco
    except mysql.connector.Error as err:
        print(f"DEBUG: Erro ao buscar elenco do filme ID {filme_id}: {err}")
        return []
    finally:
        if cursor:
            cursor.close()
        if meu_banco:
            meu_banco.close()

GENERO_ID_MAP = {
    "Ficção": 1, "Ação": 2, "Drama": 3, "Terror": 4, "Fantasia": 5,
    "Animação": 6, "Aventura": 7, "Comédia": 8, "Romance": 9, "Suspense": 10,
    "Super-Herói": 11, "Distopia": 12, "Musical": 13, "Crime": 14,
    "Esporte": 15, "Infantil": 16
}

DEFAULT_ACTOR_PHOTO_URL = 'https://placehold.co/200x300/222/fff?text=?'

def _get_or_create_ator_ids(nomes_atores, cursor):
    """
    Recebe uma lista de NOMES de atores (ex: ["Tom Hanks", "Novo Ator"]).
    Verifica se existem, cria se não existirem, e retorna uma lista de IDs.
    """
    ator_ids = []
    if not nomes_atores:
        return []
        
    for nome in nomes_atores:
        nome_limpo = nome.strip()
        if not nome_limpo:
            continue
            
        # O cursor precisa estar com dictionary=True
        cursor.execute("SELECT id FROM ator WHERE nome = %s", (nome_limpo,))
        resultado = cursor.fetchone()
        
        if resultado:
            ator_ids.append(resultado['id'])
        else:
            # Ator não existe, vamos criá-lo com uma foto placeholder
            print(f"DEBUG: Criando novo ator: {nome_limpo}")
            sql_novo_ator = "INSERT INTO ator (nome, fotoAtor) VALUES (%s, %s)"
            cursor.execute(sql_novo_ator, (nome_limpo, DEFAULT_ACTOR_PHOTO_URL))
            novo_id = cursor.lastrowid
            ator_ids.append(novo_id)
            
    return ator_ids

def _executar_adicao_filme(dados_filme, conn):
    """
    Função interna transacional para ADICIONAR um filme.
    "dados_filme" vem do AdicionarFilme.jsx.
    """
    cursor = conn.cursor()
    try:
        # 1. Mapeia Nomes de Gênero para IDs
        nomes_generos = dados_filme.get('categorias', [])
        genero_ids = [GENERO_ID_MAP[nome] for nome in nomes_generos if nome in GENERO_ID_MAP]
        
        # 2. Extrai IDs de Atores
        ator_ids = [ator['id'] for ator in dados_filme.get('atores', []) if 'id' in ator]
        
        # 3. [CORRIGIDO] Extrai IDs de Diretor e Produtora
        # O AdicionarFilme.jsx envia 'diretor' e 'produtora' como os IDs
        diretor_id = dados_filme.get('diretor')
        produtora_id = dados_filme.get('produtora')

        # 4. [CORRIGIDO] Adiciona o filme principal (SEM diretor/produtora)
        sql_filme = """
            INSERT INTO filme (titulo, sinopse, tempo_duracao, ano, poster, background, trailer, avaliacao_media)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s) 
        """
        cursor.execute(sql_filme, (
            dados_filme.get('titulo'),
            dados_filme.get('sinopse'),
            dados_filme.get('tempo_duracao'), 
            dados_filme.get('ano'),
            dados_filme.get('url_poster'),
            dados_filme.get('url_banner'),
            dados_filme.get('codigo_trailer'),
            'L' 
        ))
        filme_id = cursor.lastrowid

        if diretor_id:
            cursor.execute("INSERT INTO filme_diretor (filme_id, diretor_id) VALUES (%s, %s)", (filme_id, diretor_id))

        if produtora_id:
            cursor.execute("INSERT INTO filme_produtora (filme_id, produtora_id) VALUES (%s, %s)", (filme_id, produtora_id))

        if genero_ids:
            sql_genero = "INSERT INTO filme_genero (filme_id, genero_id) VALUES (%s, %s)"
            cursor.executemany(sql_genero, [(filme_id, g_id) for g_id in genero_ids])
        
        if ator_ids:
            sql_ator_link = "INSERT INTO filme_ator (filme_id, ator_id) VALUES (%s, %s)"
            cursor.executemany(sql_ator_link, [(filme_id, a_id) for a_id in ator_ids])
        
        return {"status": "sucesso", "filme_id": filme_id}
    
    except Exception as e:
        print(f"DEBUG: Erro em _executar_adicao_filme: {e}")
        return {"status": "erro", "mensagem": str(e)}
    
def _executar_edicao_filme(filme_id, dados_filme, conn):
    """
    Função interna transacional para EDITAR um filme.
    "dados_filme" vem do EditarFilme.jsx.
    """
    cursor = conn.cursor(dictionary=True) 
    try:
        nomes_generos = dados_filme.get('categorias', [])
        genero_ids = [GENERO_ID_MAP[nome] for nome in nomes_generos if nome in GENERO_ID_MAP]
        
        nomes_atores = dados_filme.get('atores', [])
        ator_ids = _get_or_create_ator_ids(nomes_atores, cursor)
        
        diretor_id = dados_filme.get('diretor_id')
        produtora_id = dados_filme.get('produtora_id')

        sql_filme = """
            UPDATE filme SET
                titulo = %s, sinopse = %s, tempo_duracao = %s, ano = %s, poster = %s,
                background = %s, trailer = %s
            WHERE id = %s
        """
        cursor.execute(sql_filme, (
            dados_filme.get('titulo'),
            dados_filme.get('sinopse'),
            dados_filme.get('tempo_duracao'), 
            dados_filme.get('ano'),
            dados_filme.get('url_poster'),
            dados_filme.get('url_banner'),
            dados_filme.get('trailer'),
            filme_id
        ))

        cursor.execute("DELETE FROM filme_diretor WHERE filme_id = %s", (filme_id,))
        if diretor_id:
            cursor.execute("INSERT INTO filme_diretor (filme_id, diretor_id) VALUES (%s, %s)", (filme_id, diretor_id))

        cursor.execute("DELETE FROM filme_produtora WHERE filme_id = %s", (filme_id,))
        if produtora_id:
            cursor.execute("INSERT INTO filme_produtora (filme_id, produtora_id) VALUES (%s, %s)", (filme_id, produtora_id))
        cursor.execute("DELETE FROM filme_genero WHERE filme_id = %s", (filme_id,))
        if genero_ids:
            sql_genero = "INSERT INTO filme_genero (filme_id, genero_id) VALUES (%s, %s)"
            cursor.executemany(sql_genero, [(filme_id, g_id) for g_id in genero_ids])

        cursor.execute("DELETE FROM filme_ator WHERE filme_id = %s", (filme_id,))
        if ator_ids:
            sql_ator_link = "INSERT INTO filme_ator (filme_id, ator_id) VALUES (%s, %s)"
            cursor.executemany(sql_ator_link, [(filme_id, a_id) for a_id in ator_ids])
        
        return {"status": "sucesso", "filme_id": filme_id}
    
    except Exception as e:
        print(f"DEBUG: Erro em _executar_edicao_filme: {e}")
        return {"status": "erro", "mensagem": str(e)}
    
def _criar_solicitacao(usuario_id, tipo_acao, filme_id, dados_propostos_json, conn):
    """ Salva uma nova solicitação no banco. """
    cursor = conn.cursor()
    try:
        sql = """
            INSERT INTO solicitacoes_edicao 
                (tipo_acao, status, filme_id, usuario_id, dados_propostos)
            VALUES (%s, 'PENDENTE', %s, %s, %s)
        """
        cursor.execute(sql, (tipo_acao, filme_id, usuario_id, dados_propostos_json))
        conn.commit()
        return {"status": "sucesso"}
    except Exception as e:
        conn.rollback()
        print(f"DEBUG: Erro em _criar_solicitacao: {e}")
        return {"status": "erro", "mensagem": str(e)}

def _listar_solicitacoes_pendentes(conn):
    """ Lista solicitações pendentes para o dashboard do admin. """
    cursor = conn.cursor(dictionary=True)
    try:
        sql = """
            SELECT s.*, u.nome AS usuario_nome, f.titulo AS filme_titulo
            FROM solicitacoes_edicao s
            JOIN usuario u ON s.usuario_id = u.id
            LEFT JOIN filme f ON s.filme_id = f.id
            WHERE s.status = 'PENDENTE'
            ORDER BY s.data_solicitacao ASC
        """
        cursor.execute(sql)
        solicitacoes = cursor.fetchall()

        for s in solicitacoes:
            s['dados_propostos'] = json.loads(s['dados_propostos'])
        return solicitacoes
    except Exception as e:
        print(f"DEBUG: Erro em _listar_solicitacoes_pendentes: {e}")
        return []
    
def _atualizar_status_solicitacao(solicitacao_id, novo_status, conn):
    """ Atualiza o status (APROVADA, REJEITADA) de uma solicitação. """
    cursor = conn.cursor()
    try:
        cursor.execute("UPDATE solicitacoes_edicao SET status = %s WHERE id = %s", (novo_status, solicitacao_id))
        return True
    except Exception as e:
        print(f"DEBUG: Erro em _atualizar_status_solicitacao: {e}")
        return False

def _processar_aprovacao(solicitacao_id, conn):
    """
    Função Mágica: Aprova uma solicitação.
    1. Lê a solicitação.
    2. Executa a ação (Adicionar, Editar) nos dados propostos.
    3. Atualiza o status da solicitação para 'APROVADA'.
    TUDO em uma única transação.
    """
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT * FROM solicitacoes_edicao WHERE id = %s AND status = 'PENDENTE'", (solicitacao_id,))
        solicitacao = cursor.fetchone()
        
        if not solicitacao:
            return {"status": "erro", "mensagem": "Solicitação não encontrada ou já processada."}

        dados_propostos = json.loads(solicitacao['dados_propostos'])
        tipo_acao = solicitacao['tipo_acao']
        filme_id = solicitacao['filme_id']
        
        resultado_acao = {}


        if tipo_acao == 'ADICAO':
            print(f"DEBUG: Processando aprovação de ADICAO para sol_id {solicitacao_id}")
            resultado_acao = _executar_adicao_filme(dados_propostos, conn)
            
        elif tipo_acao == 'EDICAO':
            print(f"DEBUG: Processando aprovação de EDICAO para sol_id {solicitacao_id}, filme_id {filme_id}")
            if not filme_id:
                return {"status": "erro", "mensagem": "Erro: Solicitação de edição não tem filme_id."}
            resultado_acao = _executar_edicao_filme(filme_id, dados_propostos, conn)
            
        elif tipo_acao == 'DELECAO':
            # (Você não mencionou deleção, mas a estrutura suporta)
            # resultado_acao = _executar_delecao_filme(filme_id, conn)
            pass

        # 3. Verifica se a ação deu certo
        if resultado_acao.get("status") == "sucesso":
            # 4. Atualiza o status da solicitação
            _atualizar_status_solicitacao(solicitacao_id, 'APROVADA', conn)
            conn.commit()
            print(f"DEBUG: Solicitação {solicitacao_id} aprovada com sucesso.")
            return {"status": "sucesso", "mensagem": "Solicitação aprovada e aplicada."}
        else:
            raise Exception(resultado_acao.get("mensagem", "Falha na execução da ação."))

    except Exception as e:
        conn.rollback()
        print(f"DEBUG: Falha ao processar aprovação (sol_id {solicitacao_id}): {e}")
        return {"status": "erro", "mensagem": f"Falha ao aprovar: {e}"}
    
def aprovar_filme_db(filme_id):
    """Atualiza o status de aprovação de um filme para 'Aprovado'."""
    conn = get_db_connection()
    if not conn: return False
    try:
        cursor = conn.cursor()
        cursor.execute(
            "UPDATE filme SET status = 'Aprovado' WHERE id_filme = %s",
            (filme_id,)
        )
        conn.commit()
        return cursor.rowcount > 0
    except mysql.connector.Error as err:
        print(f"DEBUG: Erro ao aprovar filme: {err}")
        conn.rollback()
        return False
    finally:
        if conn and conn.is_connected():
            conn.close()
            
def deletar_filme_db(filme_id):
    """Deleta um filme pelo ID."""
    conn = get_db_connection()
    if not conn: return False
    try:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM filme WHERE id_filme = %s", (filme_id,))
        conn.commit()
        return cursor.rowcount > 0
    except mysql.connector.Error as err:
        print(f"DEBUG: Erro ao deletar filme: {err}")
        conn.rollback()
        return False
    finally:
        if conn and conn.is_connected():
            conn.close()

class MeuManipulador(SimpleHTTPRequestHandler):

    def _set_api_headers(self, status_code):
        """Define cabeçalhos de resposta padrão para APIs (CORS)."""
        self.send_response(status_code)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Authorization, Content-Type')
        self.end_headers()

    def _serve_file(self, filename, content_type):
        """Helper para servir arquivos estáticos com cabeçalhos CORS (SPA fallback)"""
        try:
            # O sistema espera que o index.html esteja na raiz ou pasta de build
            filepath = os.path.join(".", filename) 
            with open(filepath, "rb") as f:
                self.send_response(200)
                self.send_header('Content-type', content_type)
                self.send_header('Access-Control-Allow-Origin', '*') 
                self.end_headers()
                self.wfile.write(f.read())
        except FileNotFoundError:
            self.send_error(404, f"Arquivo {filename} não encontrado.")
        except Exception as e:
            print(f"DEBUG: Erro ao servir {filename}: {e}")
            self.send_error(500, "Erro interno ao servir arquivo.")
            
    def _get_request_body(self):
        content_length = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(content_length)
        return body.decode('utf-8')

    # --- ROTEAMENTO CORS ---
    def do_OPTIONS(self):
        """Responde a requisições preflight do CORS."""
        self.send_response(204)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Authorization, Content-Type')
        self.end_headers()
        
    def _read_json_body(self):
        # Lê o corpo da requisição e tenta decodificar como JSON
        content_length = int(self.headers.get('Content-Length', 0))
        if content_length > 0:
            raw_data = self.rfile.read(content_length).decode('utf-8')
            try:
                return json.loads(raw_data)
            except json.JSONDecodeError:
                print("DEBUG: Erro ao decodificar JSON.")
                return None
        return None
    
    def _extrair_jwt(self):
        """Extrai o token JWT do cabeçalho Authorization."""
        auth_header = self.headers.get('Authorization')
        if not auth_header:
            return None
        
        # O token deve vir no formato "Bearer <token>"
        try:
            scheme, token = auth_header.split(' ', 1)
            if scheme.lower() == 'bearer':
                return token
        except ValueError:
            pass # Formato inválido

        return None
    
    def _validar_jwt(self):
        """Valida o token e retorna o payload. Envia 401 se falhar."""
        auth_header = self.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            self._set_api_headers(401)
            self.wfile.write(json.dumps({"status": "erro", "mensagem": "Token de autenticação ausente ou mal formatado."}).encode('utf-8'))
            return None
        
        token = auth_header.split(' ')[1]
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
            return payload
        except jwt.ExpiredSignatureError:
            self._set_api_headers(401)
            self.wfile.write(json.dumps({"status": "erro", "mensagem": "Token expirado."}).encode('utf-8'))
            return None
        except jwt.InvalidTokenError:
            self._set_api_headers(401)
            self.wfile.write(json.dumps({"status": "erro", "mensagem": "Token inválido."}).encode('utf-8'))
            return None

    def _validar_jwt_e_role(self, role_necessaria):
        """Valida o JWT e verifica a permissão do usuário. Retorna o payload ou None."""
        token = self._extrair_jwt()
        
        if not token:
            print("DEBUG: _validar_jwt_e_role falhou: Token ausente.")
            self._set_api_headers(401)
            self.wfile.write(json.dumps({"status": "erro", "mensagem": "Token JWT ausente."}).encode('utf-8'))
            return None
        
        try:
            # Tenta decodificar o token
            payload = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
            
            # 1. Checa a EXPIRAÇÃO (já é feita pelo jwt.decode)
            
            # 2. Checa a ROLE (papel do usuário)
            user_role = payload.get('role')
            if user_role != role_necessaria:
                print(f"DEBUG: _validar_jwt_e_role falhou: Role '{user_role}' não é a necessária '{role_necessaria}'.")
                # 403 Forbidden é mais apropriado quando a autenticação funciona, mas a autorização falha
                self._set_api_headers(403) 
                self.wfile.write(json.dumps({"status": "erro", "mensagem": "Acesso não autorizado. Permissão insuficiente."}).encode('utf-8'))
                return None
            
            # Token é válido e a role está correta
            return payload

        except jwt.exceptions.ExpiredSignatureError:
            print("DEBUG: _validar_jwt_e_role falhou: Token expirado.")
            self._set_api_headers(401)
            self.wfile.write(json.dumps({"status": "erro", "mensagem": "Token JWT expirado."}).encode('utf-8'))
            return None
        except jwt.exceptions.InvalidTokenError as e:
            print(f"DEBUG: _validar_jwt_e_role falhou: Token inválido. Erro: {e}")
            self._set_api_headers(401)
            self.wfile.write(json.dumps({"status": "erro", "mensagem": "Token JWT inválido."}).encode('utf-8'))
            return None
    
    def validar_autenticacao(self):
        """
        Verifica o cabeçalho Authorization e valida o JWT.
        Retorna o payload (dict com user_id e role) ou None se falhar.
        """
        auth_header = self.headers.get('Authorization', '')
        
        if not auth_header or not auth_header.startswith('Bearer '):
            self._set_api_headers(401)
            self.wfile.write(json.dumps({"status": "erro", "mensagem": "Token de autenticação ausente."}).encode('utf-8'))
            return None

        # Extrai o token removendo 'Bearer '
        token = auth_header[7:] 
        
        payload = decodificar_jwt(token)
        
        if 'error' in payload:
            self._set_api_headers(401) # 401 Unauthorized
            self.wfile.write(json.dumps({"status": "erro", "mensagem": payload['error']}).encode('utf-8'))
            return None
            
        return payload


    def do_GET(self):
        parsed_path = urlparse(self.path)
        path = parsed_path.path

        if path == '/admin/solicitacoes':
            payload = self._validar_jwt_e_role('admin')
            if not payload:
                return # Erro 403 já enviado

            conn = get_db_connection()
            if not conn:
                self._set_api_headers(500)
                self.wfile.write(json.dumps({"status": "erro", "mensagem": "Erro de conexão com o banco."}).encode('utf-8'))
                return
            
            try:
                solicitacoes = _listar_solicitacoes_pendentes(conn)
                self._set_api_headers(200)
                # Precisamos de um encoder customizado para 'datetime' se houver
                self.wfile.write(json.dumps(solicitacoes, default=str).encode('utf-8'))
            except Exception as e:
                self._set_api_headers(500)
                self.wfile.write(json.dumps({"status": "erro", "mensagem": f"Erro ao listar: {e}"}).encode('utf-8'))
            finally:
                if conn:
                    conn.close()
            return

        elif path == "/api/buscar-rapido":
            params = parse_qs(parsed_path.query)
            termo_busca = params.get("q", [""])[0].strip()

            filmes_encontrados = buscar_filmes_rapido(termo_busca)

            self._set_api_headers(200)
            self.wfile.write(json.dumps(filmes_encontrados, ensure_ascii=False).encode("utf-8"))
            return

        elif path == "/listar_filmes":
            meu_banco = get_db_connection()
            if not meu_banco:
                self._set_api_headers(500)
                self.wfile.write(json.dumps({"erro": "Falha na conexão com o banco de dados."}, ensure_ascii=False).encode("utf-8"))
                return

            params = parse_qs(parsed_path.query)
            filtro_titulo = params.get("titulo", [""])[0].strip()
            filtro_ano = params.get("ano", [""])[0].strip()
            filtro_diretor = params.get("diretor", [""])[0].strip()
            filtro_ator = params.get("ator", [""])[0].strip()
            filtro_genero = params.get("genero", [""])[0].strip()

            cursor = None
            try:
                cursor = meu_banco.cursor(dictionary=True)

                # 🧱 SQL base
                sql_query = """
                    SELECT 
                        f.id, 
                        f.titulo, 
                        f.ano, 
                        f.tempo_duracao, 
                        f.poster, 
                        f.poster_mini,
                        f.trailer,
                        f.avaliacao_media,
                        GROUP_CONCAT(DISTINCT g.nome SEPARATOR ' | ') AS generos,
                        GROUP_CONCAT(DISTINCT p.nome) AS produtoras, 
                        GROUP_CONCAT(DISTINCT d.nome) AS diretores,
                        GROUP_CONCAT(DISTINCT a.nome) AS atores
                    FROM filme f
                    LEFT JOIN filme_genero fg ON f.id = fg.filme_id
                    LEFT JOIN genero g ON fg.genero_id = g.id
                    LEFT JOIN filme_produtora fp ON f.id = fp.filme_id
                    LEFT JOIN produtora p ON fp.produtora_id = p.id
                    LEFT JOIN filme_diretor fd ON f.id = fd.filme_id
                    LEFT JOIN diretor d ON fd.diretor_id = d.id
                    LEFT JOIN filme_ator fa ON f.id = fa.filme_id
                    LEFT JOIN ator a ON fa.ator_id = a.id
                    WHERE 1=1
                """

                filtros = []
                valores = []

                # 🧠 Filtros opcionais
                if filtro_titulo:
                    filtros.append("AND f.titulo LIKE %s")
                    valores.append(f"%{filtro_titulo}%")
                if filtro_ano:
                    filtros.append("AND f.ano LIKE %s")
                    valores.append(f"%{filtro_ano}%")
                if filtro_diretor:
                    filtros.append("AND d.nome LIKE %s")
                    valores.append(f"%{filtro_diretor}%")
                if filtro_ator:
                    filtros.append("AND a.nome LIKE %s")
                    valores.append(f"%{filtro_ator}%")
                if filtro_genero and filtro_genero.lower() != "todos":
                    filtros.append("AND g.nome LIKE %s")
                    valores.append(f"%{filtro_genero}%")

                sql_query += "\n".join(filtros)
                sql_query += "\nGROUP BY f.id ORDER BY f.id ASC"

                cursor.execute(sql_query, valores)
                filmes = cursor.fetchall()

                self._set_api_headers(200)
                self.wfile.write(json.dumps(filmes, ensure_ascii=False, indent=4, default=str).encode("utf-8"))

            except mysql.connector.Error as err:
                print(f"Erro durante a execução do GET /listar_filmes: {err}")
                self._set_api_headers(500)
                self.wfile.write(json.dumps({"erro": str(err)}, ensure_ascii=False).encode("utf-8"))
            finally:
                if cursor:
                    cursor.close()
                if meu_banco:
                    meu_banco.close()

        elif path == "/listar_filmes_infantis":
            meu_banco = get_db_connection()
            if not meu_banco:
                self._set_api_headers(500)
                self.wfile.write(json.dumps({"erro": "Falha na conexão com o banco de dados."}, ensure_ascii=False).encode("utf-8"))
                return

            # 🔍 Coleta de parâmetros da query string
            params = parse_qs(parsed_path.query)
            filtro_titulo = params.get("titulo", [""])[0].strip()
            filtro_ano = params.get("ano", [""])[0].strip()
            filtro_diretor = params.get("diretor", [""])[0].strip()
            filtro_ator = params.get("ator", [""])[0].strip()
            filtro_genero = params.get("genero", [""])[0].strip()

            cursor = None
            try:
                cursor = meu_banco.cursor(dictionary=True)

                # 🧱 SQL base (sem a parte WHERE e GROUP BY)
                sql_query = """
                    SELECT 
                        f.id, 
                        f.titulo, 
                        f.ano, 
                        f.tempo_duracao, 
                        f.poster, 
                        f.poster_mini,
                        f.trailer,
                        f.avaliacao_media,
                        GROUP_CONCAT(DISTINCT g.nome SEPARATOR ' | ') AS generos,
                        GROUP_CONCAT(DISTINCT p.nome) AS produtoras, 
                        GROUP_CONCAT(DISTINCT d.nome) AS diretores,
                        GROUP_CONCAT(DISTINCT a.nome) AS atores
                    FROM filme f
                    LEFT JOIN filme_genero fg ON f.id = fg.filme_id
                    LEFT JOIN genero g ON fg.genero_id = g.id
                    LEFT JOIN filme_produtora fp ON f.id = fp.filme_id
                    LEFT JOIN produtora p ON fp.produtora_id = p.id
                    LEFT JOIN filme_diretor fd ON f.id = fd.filme_id
                    LEFT JOIN diretor d ON fd.diretor_id = d.id
                    LEFT JOIN filme_ator fa ON f.id = fa.filme_id
                    LEFT JOIN ator a ON fa.ator_id = a.id
                    INNER JOIN filme_categoria fc ON f.id = fc.filme_id
                    INNER JOIN categoria c ON fc.categoria_id = c.id AND c.nome = 'Filmes Infantis'
                    WHERE 1=1
                """

                filtros_where = []
                valores = []

                if filtro_titulo:
                    filtros_where.append("AND f.titulo LIKE %s")
                    valores.append(f"%{filtro_titulo}%")
                if filtro_ano:
                    filtros_where.append("AND f.ano LIKE %s")
                    valores.append(f"%{filtro_ano}%")
                if filtro_diretor:
                    filtros_where.append("AND d.nome LIKE %s")
                    valores.append(f"%{filtro_diretor}%")
                if filtro_ator:
                    filtros_where.append("AND a.nome LIKE %s")
                    valores.append(f"%{filtro_ator}%")

                sql_query += "\n".join(filtros_where)
                sql_query += "\nGROUP BY f.id"

                if filtro_genero and filtro_genero.lower() != "todos":
                    sql_query += "\nHAVING generos LIKE %s"
                    valores.append(f"%{filtro_genero}%")

                sql_query += "\nORDER BY f.id ASC"

                cursor.execute(sql_query, valores)
                filmes = cursor.fetchall()

                self._set_api_headers(200)
                self.wfile.write(json.dumps(filmes, ensure_ascii=False, indent=4, default=str).encode("utf-8"))

            except mysql.connector.Error as err:
                print(f"Erro durante a execução do GET /listar_filmes_infantis: {err}")
                self._set_api_headers(500)
                self.wfile.write(json.dumps({"erro": str(err)}, ensure_ascii=False).encode("utf-8"))
            finally:
                if cursor:
                    cursor.close()
                if meu_banco:
                    meu_banco.close()

        # Rota de "Continue assistindo" (Geral)
        elif path == "/api/continue-assistindo":
            dados_progresso = listar_progresso_simulado()
            self._set_api_headers(200)
            self.wfile.write(json.dumps(dados_progresso, ensure_ascii=False).encode("utf-8"))

        elif path == "/api/listar_filmes_infantis":
            dados_progresso = listar_progresso_simulado_infantil()
            self._set_api_headers(200)
            self.wfile.write(json.dumps(dados_progresso, ensure_ascii=False).encode("utf-8"))
        
        elif path.startswith("/filme/detalhes/"):
            # Tenta extrair o ID da URL (ex: /filme/detalhes/123 -> 123)
            try:
                filme_id = int(path.split("/")[-1])
            except ValueError:
                self._set_api_headers(400)
                self.wfile.write(json.dumps({"erro": "ID do filme inválido"}, ensure_ascii=False).encode("utf-8"))
                return

            detalhes = buscar_detalhes_filme(filme_id)
            
            if detalhes:
                self._set_api_headers(200)
                # O set_api_headers já lida com o CORS
                self.wfile.write(json.dumps(detalhes, ensure_ascii=False, indent=4).encode("utf-8"))
            else:
                self._set_api_headers(404)
                self.wfile.write(json.dumps({"erro": "Filme não encontrado."}, ensure_ascii=False).encode("utf-8"))
            return
        elif path == "/atores":
            meu_banco = get_db_connection()
            cursor = meu_banco.cursor(dictionary=True)
            cursor.execute("SELECT id, nome, fotoAtor FROM ator ORDER BY nome ASC")
            atores = cursor.fetchall()

            self._set_api_headers(200)
            self.wfile.write(json.dumps(atores, ensure_ascii=False).encode("utf-8"))
            cursor.close()
            meu_banco.close()
            return
        elif path == "/diretores":
            conn = get_db_connection()
            cursor = conn.cursor(dictionary=True)
            cursor.execute("SELECT id, nome FROM diretor ORDER BY nome ASC")
            diretores = cursor.fetchall()

            self._set_api_headers(200)
            self.wfile.write(json.dumps(diretores, ensure_ascii=False).encode("utf-8"))

            cursor.close()
            conn.close()
            return
        
        elif path == '/admin/solicitacoes':
            # 1. AUTENTICAÇÃO E PERMISSÃO
            auth_header = self.headers.get('Authorization')
            user_info = self.validar_autenticacao(auth_header) 
            
            # Se a autenticação falhar, validar_autenticacao já enviou o 401
            if not user_info:
                return
            
            # 2. Verifica se o papel do usuário é 'admin'
            if user_info.get('role') != 'admin':
                self._set_api_headers(403) # Forbidden
                self.wfile.write(json.dumps({"status": "erro", "mensagem": "Acesso negado. Apenas administradores."}).encode('utf-8'))
                return
                
            # 3. BUSCA OS DADOS REAIS NO DB
            try:
                solicitacoes = listar_solicitacoes_pendentes() 
                
                resposta = {
                    "status": "sucesso", 
                    "solicitacoes": solicitacoes
                }
                
                self._set_api_headers(200)
                self.wfile.write(json.dumps(resposta, ensure_ascii=False).encode('utf-8'))
                return
                
            except Exception as e:
                print(f"Erro ao buscar solicitações: {e}")
                traceback.print_exc() 
                self._set_api_headers(500)
                self.wfile.write(json.dumps({"status": "erro", "mensagem": "Erro interno do servidor ao buscar solicitações."}).encode('utf-8'))
                return
        
        elif path == "/produtoras":
            conn = get_db_connection()
            cursor = conn.cursor(dictionary=True)
            cursor.execute("SELECT id, nome FROM produtora ORDER BY nome ASC")
            produtoras = cursor.fetchall()

            self._set_api_headers(200)
            self.wfile.write(json.dumps(produtoras, ensure_ascii=False).encode("utf-8"))

            cursor.close()
            conn.close()
            return
        
        elif (
            path == '/' or
            path.startswith('/admin') or 
            path.startswith('/login') or
            path.startswith('/cadastro') or
            path.startswith('/contato') or
            path.startswith('/catalogo') or
            path.startswith('/cinefyKids') or
            path.startswith('/favoritos') or
            path.startswith('/adicionar') or
            path.startswith('/pagamento') or
            path.startswith('/detalhes/') or
            path.startswith('/editar/')
        ):
            self._serve_file('index.html', 'text/html')
            return

  
        else:
            try:
                # Arquivos dentro da pasta /assets são servidos diretamente
                if path.startswith("/assets/"):
                    filepath = "." + path  # ex: ./assets/imagensFilmes/avatarPoster.png

                    if os.path.isfile(filepath):
                        ctype, _ = mimetypes.guess_type(filepath)
                        self.send_response(200)
                        self.send_header("Content-Type", ctype or "application/octet-stream")
                        self.send_header("Access-Control-Allow-Origin", "*")
                        self.send_header("Cache-Control", "public, max-age=86400")  # 1 dia de cache
                        self.end_headers()

                        with open(filepath, "rb") as f:
                            self.wfile.write(f.read())
                        return
                    else:
                        self.send_error(404, "Arquivo não encontrado")
                        return

                # FALLBACK SEGURO (para outros arquivos do projeto)
                filepath = "." + path

                if os.path.isdir(filepath):
                    super().do_GET()
                    return

                if os.path.isfile(filepath):
                    ctype, _ = mimetypes.guess_type(filepath)
                    self.send_response(200)
                    self.send_header("Content-Type", ctype or "application/octet-stream")
                    self.send_header("Access-Control-Allow-Origin", "*")
                    self.send_header("Cache-Control", "public, max-age=86400")
                    self.end_headers()

                    with open(filepath, "rb") as f:
                        self.wfile.write(f.read())
                    return

                # Se chegou aqui: não existe
                self.send_error(404, "File not found")

            except Exception as e:
                print(f"Erro ao servir arquivo estático: {e}")
                self.send_error(500, "Internal Server Error")


    # --- Métodos POST ---
    def do_POST(self):
        parsed_path = urlparse(self.path)
        path = parsed_path.path

        # --- Conexão com o Banco ---
        # A conexão é obtida AQUI, ANTES do try,
        # para que o 'finally' possa fechá-la
        conn = get_db_connection()
        if not conn:
            self._set_api_headers(500)
            self.wfile.write(json.dumps({"status": "erro", "mensagem": "Erro de conexão com o banco."}).encode('utf-8'))
            return
        
        # --- Bloco TRY/EXCEPT/FINALLY ---
        # Garante que a conexão seja fechada e erros sejam tratados
        try:
            # Rota de Login (sem autenticação)
            if path == '/login':
                # Lê o corpo aqui
                form_data = json.loads(self._get_request_body())
                login = form_data.get('email', "").strip()
                senha = form_data.get('senha', "").strip()
                
                # Assume que sua função 'autenticar_usuario' existe
                resposta_json = autenticar_usuario(login, senha) 
                
                self._set_api_headers(200) 
                self.wfile.write(resposta_json.encode('utf-8'))
                return # O 'finally' fechará a conexão

            # Rota de Registro (sem autenticação)
            elif path == '/registro':
                # Lê o corpo aqui
                form_data = json.loads(self._get_request_body())
                nome = form_data.get('nome', "").strip()
                sobrenome = form_data.get('sobrenome', "").strip()
                email = form_data.get('email', "").strip()
                senha = form_data.get('senha', "").strip()
                
                # Assume que sua função 'registrar_usuario' (ou 'inserir_usuario') existe
                resposta_json = inserir_usuario(nome, sobrenome, email, senha)

                self._set_api_headers(200)
                self.wfile.write(resposta_json.encode('utf-8'))
                return # O 'finally' fechará a conexão

            # --- [ALTERADO] Rota 'Adicionar Filme' (Agora é inteligente) ---
            elif path == '/filme/adicionar':
                payload = self._validar_jwt() # REQUER AUTENTICAÇÃO
                if not payload:
                    return # O 'finally' fechará a conexão

                try:
                    dados_filme = json.loads(self._get_request_body())
                    
                    if payload['role'] == 'admin':
                        # Admin: Executa diretamente
                        print("DEBUG: Admin adicionando filme diretamente.")
                        resultado = _executar_adicao_filme(dados_filme, conn)
                        if resultado['status'] == 'sucesso':
                            self._set_api_headers(201) # 201 Created
                            self.wfile.write(json.dumps({"status": "sucesso", "mensagem": "Filme adicionado com sucesso."}).encode('utf-8'))
                        else:
                            raise Exception(resultado['mensagem'])
                    
                    else:
                        # Usuário Comum: Cria uma solicitação
                        print(f"DEBUG: Usuário {payload['user_id']} solicitando adição.")
                        resultado = _criar_solicitacao(
                            usuario_id=payload['user_id'],
                            tipo_acao='ADICAO',
                            filme_id=None,
                            dados_propostos_json=json.dumps(dados_filme),
                            conn=conn
                        )
                        if resultado['status'] == 'sucesso':
                            self._set_api_headers(202) # 202 Accepted
                            self.wfile.write(json.dumps({"status": "sucesso", "mensagem": "Solicitação de adição enviada para aprovação."}).encode('utf-8'))
                        else:
                            raise Exception(resultado['mensagem'])
                
                except Exception as e:
                    self._set_api_headers(500)
                    self.wfile.write(json.dumps({"status": "erro", "mensagem": f"Falha no servidor: {e}"}).encode('utf-8'))
                return # O 'finally' fechará a conexão

            # --- [NOVO] Rota 'Editar Filme' (Agora é inteligente) ---
            elif path.startswith('/filme/editar/'):
                payload = self._validar_jwt() # REQUER AUTENTICAÇÃO
                if not payload:
                    return # O 'finally' fechará a conexão
                
                try:
                    filme_id = int(path.split('/')[-1])
                    dados_filme = json.loads(self._get_request_body())

                    if payload['role'] == 'admin':
                        # Admin: Executa diretamente
                        print(f"DEBUG: Admin editando filme {filme_id} diretamente.")
                        resultado = _executar_edicao_filme(filme_id, dados_filme, conn)
                        if resultado['status'] == 'sucesso':
                            self._set_api_headers(200)
                            self.wfile.write(json.dumps({"status": "sucesso", "mensagem": "Filme editado com sucesso."}).encode('utf-8'))
                        else:
                            raise Exception(resultado['mensagem'])
                    
                    else:
                        # Usuário Comum: Cria uma solicitação
                        print(f"DEBUG: Usuário {payload['user_id']} solicitando edição do filme {filme_id}.")
                        resultado = _criar_solicitacao(
                            usuario_id=payload['user_id'],
                            tipo_acao='EDICAO',
                            filme_id=filme_id,
                            dados_propostos_json=json.dumps(dados_filme),
                            conn=conn
                        )
                        if resultado['status'] == 'sucesso':
                            self._set_api_headers(202) # 202 Accepted
                            self.wfile.write(json.dumps({"status": "sucesso", "mensagem": "Solicitação de edição enviada para aprovação."}).encode('utf-8'))
                        else:
                            raise Exception(resultado['mensagem'])
                
                except Exception as e:
                    self._set_api_headers(500)
                    self.wfile.write(json.dumps({"status": "erro", "mensagem": f"Falha no servidor: {e}"}).encode('utf-8'))
                return # O 'finally' fechará a conexão

            # --- [NOVO] Rota Admin 'Aprovar Solicitação' ---
            elif path.startswith('/admin/solicitacao/aprovar/'):
                payload = self._validar_jwt_e_role('admin')
                if not payload:
                    return # O 'finally' fechará a conexão

                try:
                    solicitacao_id = int(path.split('/')[-1])
                    print(f"DEBUG: Admin {payload['user_id']} tentando aprovar sol_id {solicitacao_id}.")
                    
                    # Esta função faz TUDO (executa e commita)
                    resultado = _processar_aprovacao(solicitacao_id, conn) 
                    
                    if resultado['status'] == 'sucesso':
                        self._set_api_headers(200)
                        self.wfile.write(json.dumps(resultado).encode('utf-8'))
                    else:
                        raise Exception(resultado['mensagem'])
                
                except Exception as e:
                    self._set_api_headers(500)
                    self.wfile.write(json.dumps({"status": "erro", "mensagem": f"Falha ao aprovar: {e}"}).encode('utf-8'))
                return # O 'finally' fechará a conexão

            # --- [NOVO] Rota Admin 'Rejeitar Solicitação' ---
            elif path.startswith('/admin/solicitacao/rejeitar/'):
                payload = self._validar_jwt_e_role('admin')
                if not payload:
                    return # O 'finally' fechará a conexão
                
                try:
                    solicitacao_id = int(path.split('/')[-1])
                    print(f"DEBUG: Admin {payload['user_id']} rejeitando sol_id {solicitacao_id}.")
                    
                    # Apenas atualiza o status e commita
                    resultado = _atualizar_status_solicitacao(solicitacao_id, 'REJEITADA', conn)
                    
                    if resultado:
                        conn.commit()
                        self._set_api_headers(200)
                        self.wfile.write(json.dumps({"status": "sucesso", "mensagem": "Solicitação rejeitada."}).encode('utf-8'))
                    else:
                        raise Exception("Falha ao atualizar status no banco.")

                except Exception as e:
                    conn.rollback()
                    self._set_api_headers(500)
                    self.wfile.write(json.dumps({"status": "erro", "mensagem": f"Falha ao rejeitar: {e}"}).encode('utf-8'))
                return # O 'finally' fechará a conexão
            
            # --- Rota POST não encontrada ---
            else:
                self._set_api_headers(404)
                self.wfile.write(json.dumps({"status": "erro", "mensagem": "Rota POST não encontrada."}).encode('utf-8'))

        except Exception as e:
            # Tratamento de erro GERAL para o do_POST
            import traceback
            print(f"ERRO CRÍTICO NÃO TRATADO NO DO_POST (path: {path}): {e}")
            traceback.print_exc()
            
            # Tenta reverter qualquer transação pendente
            try:
                conn.rollback()
            except Exception as rb_e:
                print(f"Erro ao tentar fazer rollback: {rb_e}")
                
            self._set_api_headers(500)
            self.wfile.write(json.dumps({"status": "erro", "mensagem": f"Falha interna grave no servidor: {e}"}).encode('utf-8'))
        
        finally:
            # GARANTE que a conexão seja sempre fechada
            if conn:
                conn.close()
                # print(f"DEBUG: Conexão com o banco fechada (path: {path}).")



    def do_PUT(self):
        parsed_path = urlparse(self.path)
        path = parsed_path.path

        if path.startswith('/filme/editar/'):
            # --- 1. AUTENTICAÇÃO E PERMISSÃO DE ADMIN ---
            user_info = self.validar_autenticacao()
            if not user_info:
                return # Resposta de erro 401 já enviada

            if user_info['role'] != 'admin':
                self._set_api_headers(403) # 403 Forbidden
                self.wfile.write(json.dumps({"status": "erro", "mensagem": "Acesso negado. Apenas administradores podem editar filmes."}).encode('utf-8'))
                return
            
            # --- 2. Leitura SEGURA dos dados (Substitui self._read_json_body()) ---
            content_length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(content_length).decode('utf-8') if content_length > 0 else ''

            try:
                form_data = json.loads(body) if body else {}
            except json.JSONDecodeError:
                self._set_api_headers(400)
                self.wfile.write(json.dumps({"status": "erro", "mensagem": "JSON inválido no corpo da requisição PUT."}).encode('utf-8'))
                return

            if not form_data:
                self._set_api_headers(400)
                self.wfile.write(json.dumps({"status": "erro", "mensagem": "Corpo da requisição inválido ou vazio."}).encode('utf-8'))
                return
            
            try:
                # Extrai o ID do filme da URL (ex: /filme/editar/15)
                filme_id = int(path.split('/')[-1])
            except ValueError:
                self._set_api_headers(400)
                self.wfile.write(json.dumps({"status": "erro", "mensagem": "ID do filme inválido na URL."}).encode('utf-8'))
                return

            try:
                # --- 3. Extração e Tratamento dos dados (Mantido do seu código) ---
                titulo = str(form_data.get('titulo', '')).strip()
                sinopse = str(form_data.get('sinopse', '')).strip()
                tempo_duracao_str = str(form_data.get('tempo_duracao', '')).strip()
                ano_str = str(form_data.get('ano', '')).strip()
                url_poster = str(form_data.get('url_poster', '')).strip()
                url_banner = str(form_data.get('url_banner', '')).strip()
                codigo_trailer = str(form_data.get('codigo_trailer', '')).strip()
                # Atores deve vir como lista de nomes (strings)
                atores_nomes = form_data.get('atores', []) 
                
                # As listas de IDs de relacionamentos
                generos_ids = form_data.get('generos', []) 
                diretores_ids = form_data.get('diretores', [])
                produtoras_ids = form_data.get('produtoras', [])


                # Conversões
                try:
                    tempo_duracao = int(tempo_duracao_str.replace('min', '').strip()) if tempo_duracao_str else 0
                except:
                    tempo_duracao = 0

                try:
                    ano = int(ano_str)
                except:
                    ano = 0

                # --- 4. Conexão com banco ---
                conn = get_db_connection()
                if not conn:
                    self._set_api_headers(500)
                    self.wfile.write(json.dumps({"status": "erro", "mensagem": "Erro na conexão com o banco."}).encode('utf-8'))
                    return

                # --- 5. Lógica de atualização no BD (Seu código) ---
                try:
                    cursor = conn.cursor()

                    # Atualiza os dados básicos do filme
                    sql_update_filme = """
                    UPDATE filme SET titulo=%s, sinopse=%s, tempo_duracao=%s, ano=%s, poster=%s, background=%s, trailer=%s
                    WHERE id=%s
                    """
                    cursor.execute(sql_update_filme, (
                        titulo, sinopse, tempo_duracao, ano, url_poster, url_banner, codigo_trailer, filme_id
                    ))

                    # Atualiza relacionamentos (Gêneros, Produtoras, Diretores, Atores)
                    
                    # Generos
                    cursor.execute("DELETE FROM filme_genero WHERE filme_id=%s", (filme_id,))
                    if isinstance(generos_ids, list):
                        for genero_id in generos_ids:
                            # Tenta garantir que o ID é um inteiro antes de inserir
                            try:
                                if int(genero_id) > 0:
                                    cursor.execute("INSERT INTO filme_genero (filme_id, genero_id) VALUES (%s, %s)", (filme_id, int(genero_id)))
                            except:
                                pass # Ignora IDs inválidos
                    
                    # Produtoras
                    cursor.execute("DELETE FROM filme_produtora WHERE filme_id=%s", (filme_id,))
                    if isinstance(produtoras_ids, list):
                        for produtora_id in produtoras_ids:
                            try:
                                if int(produtora_id) > 0: 
                                    cursor.execute("INSERT INTO filme_produtora (filme_id, produtora_id) VALUES (%s, %s)", (filme_id, int(produtora_id)))
                            except:
                                pass
                    
                    # Diretores
                    cursor.execute("DELETE FROM filme_diretor WHERE filme_id=%s", (filme_id,))
                    if isinstance(diretores_ids, list):
                        for diretor_id in diretores_ids:
                            try:
                                if int(diretor_id) > 0: 
                                    cursor.execute("INSERT INTO filme_diretor (filme_id, diretor_id) VALUES (%s, %s)", (filme_id, int(diretor_id)))
                            except:
                                pass
                        
                    # Atores (Requer get_or_create_actor_id definido no db.py, mas a lógica de chamada está correta aqui)
                    cursor.execute("DELETE FROM filme_ator WHERE filme_id=%s", (filme_id,))
                    if isinstance(atores_nomes, list):
                        for ator_nome in atores_nomes:
                            if isinstance(ator_nome, str) and ator_nome.strip():
                                # NOTE: get_or_create_actor_id deve estar definido em db.py e deve receber o cursor.
                                ator_id = get_or_create_actor_id(cursor, ator_nome.strip()) 
                                if ator_id:
                                    cursor.execute("INSERT INTO filme_ator (filme_id, ator_id) VALUES (%s, %s)", (filme_id, ator_id))

                    conn.commit()
                    self._set_api_headers(200)
                    self.wfile.write(json.dumps({"status": "sucesso", "mensagem": f"Filme {titulo} atualizado com sucesso."}).encode('utf-8'))

                except Exception as e:
                    conn.rollback()
                    import traceback
                    print(f"DEBUG: Erro ao atualizar o filme: {e}")
                    traceback.print_exc()
                    self._set_api_headers(500)
                    self.wfile.write(json.dumps({"status": "erro", "mensagem": f"Erro ao atualizar o filme: {e}"}).encode('utf-8'))
                finally:
                    if cursor: cursor.close()
                    if conn: conn.close()
                    
            except Exception as e:
                import traceback
                print(f"DEBUG: Erro inesperado no do_PUT: {e}")
                traceback.print_exc()
                self._set_api_headers(500)
                self.wfile.write(json.dumps({"status": "erro", "mensagem": "Erro interno no servidor."}).encode('utf-8'))
                return
        
        # Rota PUT não encontrada
        else:
            self._set_api_headers(404)
            self.wfile.write(json.dumps({"status": "erro", "mensagem": "Rota PUT não encontrada"}).encode('utf-8'))

    # --- INÍCIO DO NOVO DO_DELETE (Exclusivo para Admin) ---
    def do_DELETE(self):
        parsed_path = urlparse(self.path)
        path = parsed_path.path

        if path.startswith('/filme/deletar/'):
            # --- 1. AUTENTICAÇÃO E PERMISSÃO DE ADMIN ---
            user_payload = self._validar_jwt_e_role('admin') 
            if not user_payload:
                return
            
            # --- 2. Extração do ID ---
            try:
                filme_id = int(path.split('/')[-1])
            except ValueError:
                self._set_api_headers(400)
                self.wfile.write(json.dumps({"status": "erro", "mensagem": "ID do filme inválido na URL."}).encode('utf-8'))
                return

            try:
                # --- 3. Chama função de deleção (deletar_filme deve implementar a lógica do DB) ---
                filme_id = int(path.split('/')[-1])
                resposta_json = deletar_filme(filme_id)

                # --- 4. Retorno para o frontend ---
                self._set_api_headers(200)
                self.wfile.write(resposta_json.encode('utf-8'))
                return
                
            except Exception as e:
                import traceback
                print(f"DEBUG: Erro no do_DELETE para /filme/deletar/: {e}")
                traceback.print_exc()
                self._set_api_headers(500)
                self.wfile.write(json.dumps({"status": "erro", "mensagem": "Falha no servidor ao deletar o filme."}).encode('utf-8'))
                return

        # Rota DELETE não encontrada
        else:
            self._set_api_headers(404)
            self.wfile.write(json.dumps({"status": "erro", "mensagem": "Rota DELETE não encontrada."}).encode('utf-8'))
def iniciar_servidor():
    endereco_servidor = ('', 8000)
    try:
        httpd = HTTPServer(endereco_servidor, MeuManipulador)
        print("-" * 50)
        print("Servidor Python rodando em http://localhost:8000")
        print(">>> ATENÇÃO: HASHING DE SENHA COM 'bcrypt' ESTÁ ATIVO <<<")
        print("Rotas: /listar_filmes (GET), /listar_filmes_infantis (GET), /api/continue-assistindo (GET), /api/listar_filmes_infantis (GET), /login (POST), /registro (POST), /filme/adicionar (POST)")
        print(">>> Suporte a CORS ativado PARA APIS E ARQUIVOS ESTÁTICOS. <<<")
        print("-" * 50)
        httpd.serve_forever()
    except Exception as e:
        print(f"Erro ao iniciar o servidor: {e}")

if __name__ == '__main__':
    if 'BCRYPT_ERROR' in os.environ:
        print("Erro: A biblioteca 'bcrypt' não está instalada. Execute 'pip install bcrypt'.")
    else:
        iniciar_servidor()