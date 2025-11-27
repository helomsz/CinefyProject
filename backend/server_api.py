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


# ============================
# CONFIGURAÇÕES DO BANCO
# ============================
DB_CONFIG = {
    'host': "localhost",
    'user': "root",
    'password':"root",
    'database': "SERVIDORFILMES"
}

# ============================
# FUNÇÃO PARA CONECTAR AO BD
# ============================
def get_db_connection():
    try:
        # tenta criar a conexão usando as configs acima
        conn = mysql.connector.connect(**DB_CONFIG)
        conn.autocommit = False # deixa o commit manual, mais seguro
        return conn
    except mysql.connector.Error as err:
        # debug pra ver o que deu errado ao conectar
        print(f"DEBUG: ERRO CRÍTICO ao obter conexão com MySQL: {err}")
        return None


# ============================
# CHAVE SECRETA PARA TOKEN JWT
# ============================

SECRET_KEY = "ProjetoCinefyHeloisa"



# ============================
# FUNÇÃO PARA GERAR TOKEN JWT
# ============================

def gerar_jwt(user_id, role):
    payload = {
        'user_id': user_id,
        'role': role,
        # define a validade do token
        'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24), 
        'iat': datetime.datetime.utcnow()
    }

    # codifica o token e garante que retorna uma string
    token = jwt.encode(payload, SECRET_KEY, algorithm='HS256')
     # dependendo da versão da lib, pode retornar bytes, então garante uma string
    if isinstance(token, bytes):
        return token.decode('utf-8')
    return token

# ============================
# FUNÇÃO PARA VALIDAR TOKEN JWT
# ============================

def validar_jwt(token):
    try:
        # decodifica o token usando a chave secreta e o algoritmo HS256
        payload = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
        return payload
       # quando o token já passou da validade
    except jwt.ExpiredSignatureError:
        print("DEBUG: Token expirado.")
        return None
    # Qualquer outro problema que deixa o token inválido
    except jwt.InvalidTokenError as e:
        print(f"DEBUG: Token inválido: {e}")
        return None

# ============================
# VALIDAÇÃO DO HEADER DE AUTENTICAÇÃO
# ============================

def validar_autenticacao(auth_header):
    if not auth_header:
        return None
    try:
        # divide o header em bearer e o token
        scheme, token = auth_header.split(' ', 1)

        # só valida se o esquema for bearer
        if scheme.lower() == 'bearer':
            return validar_jwt(token)
    except ValueError:

        # se der erro ao separar, simplesmente ignora
        pass 
    
    return None

# ============================
# FUNÇÃO PARA DECODIFICAR JWT (RETORNA ERROS)
# ============================

def decodificar_jwt(token):
    try:
        # decodifica normalmente
        payload = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
        return payload
    except jwt.ExpiredSignatureError:

        # token expirou
        return {"error": "Token expirado"}
    except jwt.InvalidTokenError:

        # qualquer outra falha de validação
        return {"error": "Token inválido"}
    
# ============================
# INSERIR NOVO USUÁRIO NO BANCO
# ============================    

def inserir_usuario(nome, sobrenome, email, senha_pura):
    meu_banco = get_db_connection()
    if not meu_banco:
        return json.dumps({"status": "erro", "mensagem": "Falha na conexão com o banco de dados."}, ensure_ascii=False)

    cursor = None
    try:
        cursor = meu_banco.cursor()

        # verifica se o e-mail já existe
        cursor.execute("SELECT id FROM usuario WHERE email = %s", (email,))
        if cursor.fetchone():
            return json.dumps({"status": "erro", "mensagem": "Este e-mail já está cadastrado."}, ensure_ascii=False)
        
        # gera hash com bcrypt
        bytes_senha = senha_pura.encode('utf-8')
        salt = bcrypt.gensalt()
        senha_hash_bytes = bcrypt.hashpw(bytes_senha, salt)
        senha_hash = senha_hash_bytes.decode('utf-8')

        # insere usuário comum no banco
        sql = "INSERT INTO usuario (nome, sobrenome, email, senha, tipo) VALUES (%s, %s, %s, %s, 'comum')"
        valores = (nome, sobrenome, email, senha_hash)
        cursor.execute(sql, valores)
        meu_banco.commit()

        return json.dumps({"status": "sucesso", "mensagem": "Usuário cadastrado com sucesso!"}, ensure_ascii=False)

    except mysql.connector.Error as err:
        # se der erro, desfaz as operações
        if meu_banco:
            meu_banco.rollback()
        print(f"DEBUG: Erro de banco de dados ao registrar usuário: {err}")
        return json.dumps({"status": "erro", "mensagem": f"Erro interno do banco de dados: {err}"}, ensure_ascii=False)

    finally:
        # fecha cursor e conexão, mesmo se der erro
        if cursor:
            cursor.close()
        if meu_banco:
            meu_banco.close()


# ============================
# FUNÇÃO PARA GERAR HASH DA SENHA
# ============================

def gerar_hash_senha(senha_pura):
    #gera o hash bcrypt para uma senha.
    senha_bytes = senha_pura.encode('utf-8')
    salt = bcrypt.gensalt(rounds=12) 
    return bcrypt.hashpw(senha_bytes, salt).decode('utf-8')


# ============================
# AUTENTICAR USUÁRIO (LOGIN)
# ============================

def autenticar_usuario(login, senha_pura):
    meu_banco = get_db_connection()
    if not meu_banco:
        return json.dumps({"status": "erro", "mensagem": "Falha na conexão com o banco de dados."}, ensure_ascii=False)

    cursor = None
    try:
        cursor = meu_banco.cursor()

        # busca o usuário pelo e-mail
        cursor.execute("SELECT id, nome, tipo, senha FROM usuario WHERE email = %s", (login,))
        resultado = cursor.fetchone()

        if not resultado:
            return json.dumps({"status": "erro", "mensagem": "E-mail ou senha inválidos."}, ensure_ascii=False)
        
        # extrai informações
        user_id, user_name, user_type, senha_hash_ou_pura = resultado

        # garantindo que todos os campos estão como string
        if isinstance(user_name, bytes):
            user_name = user_name.decode('utf-8')
        if isinstance(user_type, bytes):
            user_type = user_type.decode('utf-8')
        if isinstance(senha_hash_ou_pura, bytes):
            senha_hash_ou_pura = senha_hash_ou_pura.decode('utf-8')
            
        senha_correta = False
        
        #  tenta verificar a senha com bcrypt 
        if senha_hash_ou_pura and (senha_hash_ou_pura.startswith('$2b$') or senha_hash_ou_pura.startswith('$2a$') or senha_hash_ou_pura.startswith('$2d$')):
            try:
                if bcrypt.checkpw(senha_pura.encode('utf-8'), senha_hash_ou_pura.encode('utf-8')):
                    senha_correta = True
            except ValueError as e:
                print(f"DEBUG: Erro de bcrypt ao verificar senha: {e}")
                senha_correta = False # se o bcrypt falhar, a senha não é correta
                
        #  tenta verificar a senha sem hash, se não for hash, tenta validar como texto puro
        if not senha_correta and senha_hash_ou_pura == senha_pura:
            senha_correta = True
            print(f"DEBUG: Migrando senha para hash para o usuário {login}...")
        
        # se a senha estiver correta
        if senha_correta:

            token_jwt = gerar_jwt(user_id, user_type)
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
        # captura erro genérico da autenticação
        print(f"DEBUG: Erro durante a autenticação. Detalhes do Erro: {repr(err)}")
        try:
             return json.dumps({"status": "erro", "mensagem": "Erro interno no servidor."}, ensure_ascii=False)
        except:
             # caso até o json falhe
             return '{"status": "erro", "mensagem": "Erro de serialização crítica no servidor."}'
    finally:
        if cursor:
            cursor.close()
        if meu_banco:
            meu_banco.close()
            

# ============================
# RELACIONAMENTO ENTRE FILME E OUTRAS TABELAS AUXILIARES
# ============================ 
            
def _inserir_relacionamento(cursor, filme_id, tabela_rel, coluna_id_rel, lista):
    # se a lista vier vazia, não faz nada
    if not lista:
        return
    
    # converte string "1,2,3" em lista real
    if isinstance(lista, str):
        lista = [item.strip() for item in lista.split(',') if item.strip()]

    # se vier algo não lista, ignoramos    
    elif not isinstance(lista, list):
        return

    for item in lista:
        id_relacionamento = None

        # tenta converter para número (ID)
        try:
            id_relacionamento = int(item)
        except (ValueError, TypeError):
            # se não for número, tenta buscar por nome no banco
            sql_busca_id = "SELECT id FROM genero WHERE nome = %s"
            cursor.execute(sql_busca_id, (item,))
            resultado = cursor.fetchone()
            if resultado:
                id_relacionamento = resultado[0]
            else:
                # se não achar, pula
                continue

        # insere relacionamento na tabela de associação    
        sql_insert_rel = f"INSERT INTO {tabela_rel} (filme_id, {coluna_id_rel}) VALUES (%s, %s)"
        cursor.execute(sql_insert_rel, (filme_id, id_relacionamento))

# ============================
# INSERIR UM NOVO FILME NO BANCO
# ============================
def inserir_filme(titulo, sinopse, tempo_duracao, ano, poster, background, trailer, avaliacao_media, generos, diretores, atores, produtoras):
    meu_banco = get_db_connection()
    if not meu_banco:
        # Falha de conexão com o banco
        return json.dumps({"status": "erro", "mensagem": "Falha na conexão com o banco de dados."}, ensure_ascii=False)

    cursor = None
    try:
        cursor = meu_banco.cursor()

         # SQL para inserir um filme
        sql_filme = """
            INSERT INTO filme 
            (titulo, sinopse, tempo_duracao, ano, poster, poster_mini, background, trailer, avaliacao_media, status) 
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """

        # Caso o poster_mini não seja enviado, usa um padrão
        poster_mini = poster if poster else 'default.jpg'

        # Monta os valores que serão enviados no insert
        valores_filme = (titulo, sinopse, tempo_duracao, ano, poster, poster_mini, background, trailer, avaliacao_media, status)

        # executa o insert
        cursor.execute(sql_filme, valores_filme)

        # pega ID do filme recém-inserido
        filme_id = cursor.lastrowid


        # insere relacionamentos auxiliares (gêneros, diretores, atores, produtoras)
        _inserir_relacionamento(cursor, filme_id, 'filme_genero', 'genero_id', generos)
        _inserir_relacionamento(cursor, filme_id, 'filme_diretor', 'diretor_id', diretores)
        _inserir_relacionamento(cursor, filme_id, 'filme_ator', 'ator_id', atores)
        _inserir_relacionamento(cursor, filme_id, 'filme_produtora', 'produtora_id', produtoras)

        # seta o status após tudo 
        status = 'Pendente_Adicao'

        # finaliza a transação
        meu_banco.commit()

        return json.dumps({"status": "sucesso", "mensagem": f"Filme '{titulo}' (ID: {filme_id}) inserido com sucesso."}, ensure_ascii=False)

    except mysql.connector.Error as err:
        # se algo falhar no banco, reverte a transação
        if meu_banco:
            meu_banco.rollback()
        print(f"DEBUG: Erro de banco de dados ao inserir filme: {err}")
        return json.dumps({"status": "erro", "mensagem": f"Erro ao inserir filme: {err}"}, ensure_ascii=False)

    finally:
        # fecha tudo corretamente
        if cursor:
            cursor.close()
        if meu_banco:
            meu_banco.close()


# ============================
# LISTAR PROGRESSO SIMULADO 
# ============================
def listar_progresso_simulado():
    meu_banco = get_db_connection()
    if not meu_banco:
        return []

    cursor = None
    try:
        cursor = meu_banco.cursor(dictionary=True)

        # sql com prioridade simulada (top 4)
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

        # progresso fake só para simulação
        simulacoes_progresso = [30, 14, 55, 59]
        lista_progresso_final = []

        for i, filme in enumerate(filmes_base):
            # seleciona o progresso correspondente ao filme
            progresso_minutos = simulacoes_progresso[i] if i < len(simulacoes_progresso) else 0

             #alteração de título somente para testes visuais
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
        # caso dê problema no SELECT
        print(f"DEBUG: Erro de banco de dados ao buscar progresso geral: {err}")
        return []
    finally:
        if cursor:
            cursor.close()
        if meu_banco:
            meu_banco.close()


# ============================
# LISTAR PROGRESSO SIMULADO (INFANTIL)
# ============================
def listar_progresso_simulado_infantil():
    meu_banco = get_db_connection()
    if not meu_banco:
        return []

    cursor = None
    try:
        cursor = meu_banco.cursor(dictionary=True)

        # aql para pegar filmes da categoria "filmes infantis"
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

        # progresso simulado fixo para cada uma das 4 posições
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


# ============================
# BUSCA RÁPIDA DE FILMES NA NAV
# ============================
def buscar_filmes_rapido(termo_busca):

    # se não tiver termo ou for muito curto, não busca nada
    if not termo_busca or len(termo_busca.strip()) < 3:
        return [] 
        
    meu_banco = get_db_connection()
    if not meu_banco:
        return []

    cursor = None
    try:
        cursor = meu_banco.cursor(dictionary=True)

        # SQL usando fulltext com against (pesquisa rápida)
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
        
        # adiciona wildcard para busca parcial (termo)
        termo_ft = f"*{termo_busca.strip()}*" 
        valores = (termo_ft,)

        cursor.execute(sql_query, valores)
        
        # retorna todos os filmes encontrados durante a busca
        filmes = cursor.fetchall()
        
        return filmes

    except mysql.connector.Error as err:
        print(f"DEBUG: Erro de banco de dados ao buscar filmes rápido: {err}")
        return []
    finally:
        if cursor:
            cursor.close()


# ============================
# BUSCAR DETALHES COMPLETOS DE UM FILME
# ============================            

def buscar_detalhes_filme(filme_id):
    meu_banco = get_db_connection()
    if not meu_banco:
        return None

    cursor = None
    try:
        cursor = meu_banco.cursor(dictionary=True)


        # query gigante com joins e concatenações de nomes (gêneros, diretores etc.)    
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

        # executa a busca do filme
        cursor.execute(sql_query, (filme_id,))
        filme = cursor.fetchone()

        if filme:
            # busca elenco separado
            elenco = buscar_elenco_filme(filme_id)
            filme['elenco_completo'] = elenco

            # base fixa para montar URLs de imagens
            base_url_assets = "http://localhost:8000/assets/imagensFilmes/"

            # limpa e monta URL do poster
            if filme['poster']:
                caminho_limpo = filme['poster'].split('/')[-1] 
                filme['poster'] = base_url_assets + caminho_limpo

            # converte background também    
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

# ============================
# BUSCAR ELENCO COMPLETO DE UM FILME
# ============================
def buscar_elenco_filme(filme_id):
    meu_banco = get_db_connection()
    if not meu_banco:
        return []
    cursor = None
    try:
        cursor = meu_banco.cursor(dictionary=True)

        # busca atores vinculados ao filme
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

# ============================
# MAPA DE GÊNEROS COM OS IDS
# ============================
GENERO_ID_MAP = {
    "Ficção": 1, "Ação": 2, "Drama": 3, "Terror": 4, "Fantasia": 5,
    "Animação": 6, "Aventura": 7, "Comédia": 8, "Romance": 9, "Suspense": 10,
    "Super-Herói": 11, "Distopia": 12, "Musical": 13, "Crime": 14,
    "Esporte": 15, "Infantil": 16
}

# ============================
# FOTO PADRÃO PARA ATORES SEM IMAGEM
# ============================
DEFAULT_ACTOR_PHOTO_URL = 'https://placehold.co/200x300/222/fff?text=?'


# ============================
# OBTÉM OU CRIA ATORES E RETORNA SEUS IDs
# ============================
def _get_or_create_ator_ids(nomes_atores, cursor):
    ator_ids = []

    # Se não vier lista, retorna vazia
    if not nomes_atores:
        return []
        
    for nome in nomes_atores:
        nome_limpo = nome.strip()
        if not nome_limpo:
            continue

        # Procura ator já existente no banco
        cursor.execute("SELECT id FROM ator WHERE nome = %s", (nome_limpo,))
        resultado = cursor.fetchone()
        
        if resultado:
            # Se já existe, só adiciona o ID
            ator_ids.append(resultado['id'])
        else:
            # caso contrário, cria ator novo
            print(f"DEBUG: Criando novo ator: {nome_limpo}")
            sql_novo_ator = "INSERT INTO ator (nome, fotoAtor) VALUES (%s, %s)"
            cursor.execute(sql_novo_ator, (nome_limpo, DEFAULT_ACTOR_PHOTO_URL))
            novo_id = cursor.lastrowid
            ator_ids.append(novo_id)
            
    return ator_ids


# ============================
# EXECUTA AÇÃO DE INSERIR UM NOVO FILME
# ============================
def _executar_adicao_filme(dados_filme, conn):
    cursor = conn.cursor()
    try:
        # pega categorias e converte para IDs usando o mapa
        nomes_generos = dados_filme.get('categorias', [])
        genero_ids = [GENERO_ID_MAP[nome] for nome in nomes_generos if nome in GENERO_ID_MAP]
        
        # pega IDs de atores enviados
        ator_ids = [ator['id'] for ator in dados_filme.get('atores', []) if 'id' in ator]

        # diretor e produtora
        diretor_id = dados_filme.get('diretor')
        produtora_id = dados_filme.get('produtora')

        # inserção principal na tabela filme
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
            'L' # valor colocado literalmente, como no original
        ))

        # id do filme inserido
        filme_id = cursor.lastrowid

        # --- Relacionamentos ---
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
        # se qualquer coisa der errado, apenas registra o debug e retorna erro
        print(f"DEBUG: Erro em _executar_adicao_filme: {e}")
        return {"status": "erro", "mensagem": str(e)}
    

# ============================
# EXECUTA AÇÃO DE EDITAR UM FILME EXISTENTE
# ============================    
def _executar_edicao_filme(filme_id, dados_filme, conn):
    cursor = conn.cursor(dictionary=True) 
    try:
        # converte categorias para IDs
        nomes_generos = dados_filme.get('categorias', [])
        genero_ids = [GENERO_ID_MAP[nome] for nome in nomes_generos if nome in GENERO_ID_MAP]
        
        # pega lista de nomes dos atores, criando eles se necessário
        nomes_atores = dados_filme.get('atores', [])
        ator_ids = _get_or_create_ator_ids(nomes_atores, cursor)
        
        diretor_id = dados_filme.get('diretor_id')
        produtora_id = dados_filme.get('produtora_id')

        # atualiza os dados do filme
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


        # --- Atualiza relações ---
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
    

# ============================
# CRIA UMA SOLICITAÇÃO DE EDIÇÃO / ADIÇÃO
# ============================    
def _criar_solicitacao(usuario_id, tipo_acao, filme_id, dados_propostos_json, conn):
    #salva uma nova solicitação no banco.
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
        # se falhar, desfaz alterações
        conn.rollback()
        print(f"DEBUG: Erro em _criar_solicitacao: {e}")
        return {"status": "erro", "mensagem": str(e)}

# ============================
# lista solicitações pendentes no painel do admin
# ============================
def _listar_solicitacoes_pendentes(conn):
    #lista solicitações pendentes para o dashboard do admin.
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


        # converte json salvo no banco para dicionário python
        for s in solicitacoes:
            s['dados_propostos'] = json.loads(s['dados_propostos'])
        return solicitacoes
    except Exception as e:
        print(f"DEBUG: Erro em _listar_solicitacoes_pendentes: {e}")
        return []

# ============================
# atualiza status de solicitação
# ============================    
def _atualizar_status_solicitacao(solicitacao_id, novo_status, conn):
    # atualiza o status (aprovada, rejeitada) de uma solicitação.
    cursor = conn.cursor()
    try:
        cursor.execute("UPDATE solicitacoes_edicao SET status = %s WHERE id = %s", (novo_status, solicitacao_id))
        return True
    except Exception as e:
        print(f"DEBUG: Erro em _atualizar_status_solicitacao: {e}")
        return False

# ============================
# processa aprovação (aplicação da ação)
# ============================
def _processar_aprovacao(solicitacao_id, conn):
    cursor = conn.cursor(dictionary=True)
    try:
        # busca a solicitação e garante que ainda está pendente
        cursor.execute("SELECT * FROM solicitacoes_edicao WHERE id = %s AND status = 'PENDENTE'", (solicitacao_id,))
        solicitacao = cursor.fetchone()
        
        if not solicitacao:
            return {"status": "erro", "mensagem": "Solicitação não encontrada ou já processada."}


        # carrega dados enviados pelo usuário
        dados_propostos = json.loads(solicitacao['dados_propostos'])
        tipo_acao = solicitacao['tipo_acao']
        filme_id = solicitacao['filme_id']
        
        resultado_acao = {}

        # trata cada tipo de ação
        if tipo_acao == 'ADICAO':
            print(f"DEBUG: Processando aprovação de ADICAO para sol_id {solicitacao_id}")
            resultado_acao = _executar_adicao_filme(dados_propostos, conn)
            
        elif tipo_acao == 'EDICAO':
            print(f"DEBUG: Processando aprovação de EDICAO para sol_id {solicitacao_id}, filme_id {filme_id}")
            if not filme_id:
                return {"status": "erro", "mensagem": "Erro: Solicitação de edição não tem filme_id."}
            resultado_acao = _executar_edicao_filme(filme_id, dados_propostos, conn)
            
        elif tipo_acao == 'DELECAO':
            pass

        # se deu certo, aprova a solicitação
        if resultado_acao.get("status") == "sucesso":
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
    

# ============================
# aprovar filme diretamente no banco
# ============================
def aprovar_filme_db(filme_id):
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


# ============================
# deletar filme diretamente no banco
# ============================ 
def deletar_filme_db(filme_id):
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

# ==========================================================
# classe responsável por lidar com requests HTTP
# ==========================================================
class MeuManipulador(SimpleHTTPRequestHandler):

    # configura headers padrão da api
    def _set_api_headers(self, status_code):
        self.send_response(status_code)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Authorization, Content-Type')
        self.end_headers()


    # servidor de arquivos estáticos
    def _serve_file(self, filename, content_type):
        try:
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
    # le corpo bruto da requisição
    def _get_request_body(self):
        content_length = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(content_length)
        return body.decode('utf-8')

    # =====================
    # suporte a requisições cors
    # =====================-
    def do_OPTIONS(self):
        """responde a requisições preflight do cors."""
        self.send_response(204)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Authorization, Content-Type')
        self.end_headers()
        
    # =====================
    # tenta ler um json do body
    # =====================
    def _read_json_body(self):
        # le o corpo da requisição e tenta decodificar como JSON
        content_length = int(self.headers.get('Content-Length', 0))
        if content_length > 0:
            raw_data = self.rfile.read(content_length).decode('utf-8')
            try:
                return json.loads(raw_data)
            except json.JSONDecodeError:
                print("DEBUG: Erro ao decodificar JSON.")
                return None
        return None
    
    # =====================
    # extrai jwt do header authorization
    # =====================
    def _extrair_jwt(self):
        auth_header = self.headers.get('Authorization')
        if not auth_header:
            return None
        try:
            scheme, token = auth_header.split(' ', 1)
            if scheme.lower() == 'bearer':
                return token
        except ValueError:
            pass #formato inválido

        return None
    
    # =====================
    # valida jwt
    # =====================
    def _validar_jwt(self):
         # valida o token e retorna o payload. envia 401 se falhar.
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
            # ocorre quando o token expirou
            self._set_api_headers(401)
            self.wfile.write(json.dumps({"status": "erro", "mensagem": "Token expirado."}).encode('utf-8'))
            return None
        except jwt.InvalidTokenError:
            # ocorre quando o token é inválido ou adulterado
            self._set_api_headers(401)
            self.wfile.write(json.dumps({"status": "erro", "mensagem": "Token inválido."}).encode('utf-8'))
            return None

    # =====================
    # valida jwt e permissão do usuário
    # =====================
    def _validar_jwt_e_role(self, role_necessaria):
        # valida o jwt e verifica a permissão do usuário. retorna o payload ou none.
        token = self._extrair_jwt()
        
        if not token:
             # falha porque o token não foi enviado
            print("DEBUG: _validar_jwt_e_role falhou: Token ausente.")
            self._set_api_headers(401)
            self.wfile.write(json.dumps({"status": "erro", "mensagem": "Token JWT ausente."}).encode('utf-8'))
            return None
        
        try:
            # tenta decodificar o token jwt
            payload = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
            
            
            # extrai o papel do usuário (admin, user etc.)
            user_role = payload.get('role')
            if user_role != role_necessaria:
                # bloqueia acesso se a role for diferente
                print(f"DEBUG: _validar_jwt_e_role falhou: Role '{user_role}' não é a necessária '{role_necessaria}'.")
                self._set_api_headers(403) 
                self.wfile.write(json.dumps({"status": "erro", "mensagem": "Acesso não autorizado. Permissão insuficiente."}).encode('utf-8'))
                return None
            return payload

        except jwt.exceptions.ExpiredSignatureError:
            # erro quando o token está expirado
            print("DEBUG: _validar_jwt_e_role falhou: Token expirado.")
            self._set_api_headers(401)
            self.wfile.write(json.dumps({"status": "erro", "mensagem": "Token JWT expirado."}).encode('utf-8'))
            return None
        except jwt.exceptions.InvalidTokenError as e:
            # erro quando o token é inválido
            print(f"DEBUG: _validar_jwt_e_role falhou: Token inválido. Erro: {e}")
            self._set_api_headers(401)
            self.wfile.write(json.dumps({"status": "erro", "mensagem": "Token JWT inválido."}).encode('utf-8'))
            return None
    
    # =====================
    # valida autenticação
    # =====================
    def validar_autenticacao(self):
        # valida apenas se o token jwt existe e é válido
        auth_header = self.headers.get('Authorization', '')
        
        if not auth_header or not auth_header.startswith('Bearer '):
            # erro quando o cabeçalho authorization não está presente corretamente
            self._set_api_headers(401)
            self.wfile.write(json.dumps({"status": "erro", "mensagem": "Token de autenticação ausente."}).encode('utf-8'))
            return None

        # extrai o token removendo 'bearer '
        token = auth_header[7:] 
        
        payload = decodificar_jwt(token)
        
        if 'error' in payload:
            # jwt inválido ou expirado
            self._set_api_headers(401)
            self.wfile.write(json.dumps({"status": "erro", "mensagem": payload['error']}).encode('utf-8'))
            return None
            
        return payload

    # =====================
    # requisições do método get
    # =====================
    def do_GET(self):
        # trata requisições http get
        parsed_path = urlparse(self.path)
        path = parsed_path.path

        if path == '/admin/solicitacoes':
            # verifica se o usuário tem papel de admin
            payload = self._validar_jwt_e_role('admin')
            if not payload:
                return 

            conn = get_db_connection()
            if not conn:
                # erro ao conectar no banco de dados
                self._set_api_headers(500)
                self.wfile.write(json.dumps({"status": "erro", "mensagem": "Erro de conexão com o banco."}).encode('utf-8'))
                return
            
            try:
                # obtém as solicitações pendentes
                solicitacoes = _listar_solicitacoes_pendentes(conn)
                self._set_api_headers(200)
                self.wfile.write(json.dumps(solicitacoes, default=str).encode('utf-8'))
            except Exception as e:
                # erro inesperado
                self._set_api_headers(500)
                self.wfile.write(json.dumps({"status": "erro", "mensagem": f"Erro ao listar: {e}"}).encode('utf-8'))
            finally:
                if conn:
                    conn.close()
            return

        elif path == "/api/buscar-rapido":
            # busca filmes rapidamente pelo termo
            params = parse_qs(parsed_path.query)
            termo_busca = params.get("q", [""])[0].strip()

            filmes_encontrados = buscar_filmes_rapido(termo_busca)

            self._set_api_headers(200)
            self.wfile.write(json.dumps(filmes_encontrados, ensure_ascii=False).encode("utf-8"))
            return

        elif path == "/listar_filmes":
            # lista filmes com filtros opcionais
            meu_banco = get_db_connection()
            if not meu_banco:
                # caso o banco não conecte
                self._set_api_headers(500)
                self.wfile.write(json.dumps({"erro": "Falha na conexão com o banco de dados."}, ensure_ascii=False).encode("utf-8"))
                return

            # captura parâmetros de busca
            params = parse_qs(parsed_path.query)
            filtro_titulo = params.get("titulo", [""])[0].strip()
            filtro_ano = params.get("ano", [""])[0].strip()
            filtro_diretor = params.get("diretor", [""])[0].strip()
            filtro_ator = params.get("ator", [""])[0].strip()
            filtro_genero = params.get("genero", [""])[0].strip()

            cursor = None
            try:
                cursor = meu_banco.cursor(dictionary=True)

                # consulta principal com joins para relacionamentos
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

                # aplica os filtros dinamicamente
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
                
                # resposta ao cliente
                self._set_api_headers(200)
                self.wfile.write(json.dumps(filmes, ensure_ascii=False, indent=4, default=str).encode("utf-8"))

            except mysql.connector.Error as err:
                # erro durante execução do sql
                print(f"Erro durante a execução do GET /listar_filmes: {err}")
                self._set_api_headers(500)
                self.wfile.write(json.dumps({"erro": str(err)}, ensure_ascii=False).encode("utf-8"))
            finally:
                if cursor:
                    cursor.close()
                if meu_banco:
                    meu_banco.close()

        elif path == "/listar_filmes_infantis":
            # conecta ao banco para listar filmes infantis
            meu_banco = get_db_connection()
            if not meu_banco:
                # erro se não conseguir conectar ao banco
                self._set_api_headers(500)
                self.wfile.write(json.dumps({"erro": "Falha na conexão com o banco de dados."}, ensure_ascii=False).encode("utf-8"))
                return
            
            # captura os filtros enviados via query string
            params = parse_qs(parsed_path.query)
            filtro_titulo = params.get("titulo", [""])[0].strip()
            filtro_ano = params.get("ano", [""])[0].strip()
            filtro_diretor = params.get("diretor", [""])[0].strip()
            filtro_ator = params.get("ator", [""])[0].strip()
            filtro_genero = params.get("genero", [""])[0].strip()

            cursor = None
            try:
                cursor = meu_banco.cursor(dictionary=True)

                # consulta base para buscar filmes da categoria infantil
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

                # prepara lista de filtros opcionais
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

                # adiciona os filtros dinâmicos
                sql_query += "\n".join(filtros_where)
                sql_query += "\nGROUP BY f.id"

                # aplica filtro de gênero usando having
                if filtro_genero and filtro_genero.lower() != "todos":
                    sql_query += "\nHAVING generos LIKE %s"
                    valores.append(f"%{filtro_genero}%")

                sql_query += "\nORDER BY f.id ASC"
                
                # executa consulta
                cursor.execute(sql_query, valores)
                filmes = cursor.fetchall()

                # envia resposta
                self._set_api_headers(200)
                self.wfile.write(json.dumps(filmes, ensure_ascii=False, indent=4, default=str).encode("utf-8"))

            except mysql.connector.Error as err:
                # erro durante execução da consulta
                print(f"Erro durante a execução do GET /listar_filmes_infantis: {err}")
                self._set_api_headers(500)
                self.wfile.write(json.dumps({"erro": str(err)}, ensure_ascii=False).encode("utf-8"))
            finally:
                # fecha cursor e conexão
                if cursor:
                    cursor.close()
                if meu_banco:
                    meu_banco.close()

        elif path == "/api/continue-assistindo":
            # retorna lista simulada de progresso do usuário
            dados_progresso = listar_progresso_simulado()
            self._set_api_headers(200)
            self.wfile.write(json.dumps(dados_progresso, ensure_ascii=False).encode("utf-8"))

        elif path == "/api/listar_filmes_infantis":
            # retorna dados simulados de filmes infantis
            dados_progresso = listar_progresso_simulado_infantil()
            self._set_api_headers(200)
            self.wfile.write(json.dumps(dados_progresso, ensure_ascii=False).encode("utf-8"))
        
        elif path.startswith("/filme/detalhes/"):
            # tenta extrair o id do filme da url
            try:
                filme_id = int(path.split("/")[-1])
            except ValueError:
                # retorna erro se o id não for número
                self._set_api_headers(400)
                self.wfile.write(json.dumps({"erro": "ID do filme inválido"}, ensure_ascii=False).encode("utf-8"))
                return
            
            # busca detalhes do filme
            detalhes = buscar_detalhes_filme(filme_id)
            
            if detalhes:
                # envia detalhes do filme encontrado
                self._set_api_headers(200)
                self.wfile.write(json.dumps(detalhes, ensure_ascii=False, indent=4).encode("utf-8"))
            else:
                # retorna erro se o filme não existe
                self._set_api_headers(404)
                self.wfile.write(json.dumps({"erro": "Filme não encontrado."}, ensure_ascii=False).encode("utf-8"))
            return
        elif path == "/atores":
            # consulta lista de atores
            meu_banco = get_db_connection()
            cursor = meu_banco.cursor(dictionary=True)
            cursor.execute("SELECT id, nome, fotoAtor FROM ator ORDER BY nome ASC")
            atores = cursor.fetchall()

            # envia lista de atores
            self._set_api_headers(200)
            self.wfile.write(json.dumps(atores, ensure_ascii=False).encode("utf-8"))
            cursor.close()
            meu_banco.close()
            return
        elif path == "/diretores":
            # consulta lista de diretores
            conn = get_db_connection()
            cursor = conn.cursor(dictionary=True)
            cursor.execute("SELECT id, nome FROM diretor ORDER BY nome ASC")
            diretores = cursor.fetchall()

            # envia lista de diretores
            self._set_api_headers(200)
            self.wfile.write(json.dumps(diretores, ensure_ascii=False).encode("utf-8"))

            cursor.close()
            conn.close()
            return
        
        elif path == '/admin/solicitacoes':
            # validação de administrador
            auth_header = self.headers.get('Authorization')
            user_info = self.validar_autenticacao(auth_header) 
            if not user_info:
                return
            if user_info.get('role') != 'admin':
                # bloqueia caso não seja admin
                self._set_api_headers(403) 
                self.wfile.write(json.dumps({"status": "erro", "mensagem": "Acesso negado. Apenas administradores."}).encode('utf-8'))
                return
            try:
                # obtém lista de solicitações pendentes
                solicitacoes = listar_solicitacoes_pendentes() 
                
                resposta = {
                    "status": "sucesso", 
                    "solicitacoes": solicitacoes
                }
                
                # envia resposta
                self._set_api_headers(200)
                self.wfile.write(json.dumps(resposta, ensure_ascii=False).encode('utf-8'))
                return
                
            except Exception as e:
                # erro inesperado ao listar solicitações
                print(f"Erro ao buscar solicitações: {e}")
                traceback.print_exc() 
                self._set_api_headers(500)
                self.wfile.write(json.dumps({"status": "erro", "mensagem": "Erro interno do servidor ao buscar solicitações."}).encode('utf-8'))
                return
        
        elif path == "/produtoras":
            # lista produtoras cadastradas
            conn = get_db_connection()
            cursor = conn.cursor(dictionary=True)
            cursor.execute("SELECT id, nome FROM produtora ORDER BY nome ASC")
            produtoras = cursor.fetchall()

            # envia resposta
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
            
            # serve o arquivo principal do front-end
            self._serve_file('index.html', 'text/html')
            return

  
        else:
            try:
                if path.startswith("/assets/"):
                    filepath = "." + path

                    if os.path.isfile(filepath):
                         # detecta o tipo de arquivo automaticamente
                        ctype, _ = mimetypes.guess_type(filepath)
                        self.send_response(200)
                        self.send_header("Content-Type", ctype or "application/octet-stream")
                        self.send_header("Access-Control-Allow-Origin", "*")
                        self.send_header("Cache-Control", "public, max-age=86400") 
                        self.end_headers()

                        with open(filepath, "rb") as f:
                            self.wfile.write(f.read())
                        return
                    else:
                        # caso o arquivo não exista
                        self.send_error(404, "Arquivo não encontrado")
                        return
                filepath = "." + path

                # se for diretório, usa comportamento padrão
                if os.path.isdir(filepath):
                    super().do_GET()
                    return
                
                # serve arquivos estáticos gerais
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

                # erro quando o arquivo solicitado não existe
                self.send_error(404, "File not found")

            except Exception as e:
                # erro inesperado ao servir arquivo estático
                print(f"Erro ao servir arquivo estático: {e}")
                self.send_error(500, "Internal Server Error")


    # =====================
    # requisições do método post
    # =====================
    def do_POST(self):
        parsed_path = urlparse(self.path)  # pega o caminho da requisição
        path = parsed_path.path
        conn = get_db_connection()  # tenta conectar ao banco
        if not conn:
            # erro se o banco não conectar
            self._set_api_headers(500)
            self.wfile.write(json.dumps({"status": "erro", "mensagem": "Erro de conexão com o banco."}).encode('utf-8'))
            return

        try:
            # --- LOGIN ---
            if path == '/login':
                form_data = json.loads(self._get_request_body()) # pega dados enviados
                login = form_data.get('email', "").strip()
                senha = form_data.get('senha', "").strip()

                # chama função que valida login
                resposta_json = autenticar_usuario(login, senha) 
                

                # resposta enviada ao front-end
                self._set_api_headers(200) 
                self.wfile.write(resposta_json.encode('utf-8'))
                return 

            # --- REGISTRO DE USUÁRIO ---
            elif path == '/registro':
                form_data = json.loads(self._get_request_body())
                nome = form_data.get('nome', "").strip()
                sobrenome = form_data.get('sobrenome', "").strip()
                email = form_data.get('email', "").strip()
                senha = form_data.get('senha', "").strip()

                # chama função que cria usuário
                resposta_json = inserir_usuario(nome, sobrenome, email, senha)

                self._set_api_headers(200)
                self.wfile.write(resposta_json.encode('utf-8'))
                return 

            # --- ADICIONAR FILME ---
            elif path == '/filme/adicionar':
                payload = self._validar_jwt() #autenticação
                if not payload:
                    return

                try:
                    dados_filme = json.loads(self._get_request_body()) # pega dados do filme enviado pelo usuário
                    
                    if payload['role'] == 'admin':
                        # admin pode adicionar direto
                        print("DEBUG: Admin adicionando filme diretamente.")
                        resultado = _executar_adicao_filme(dados_filme, conn)
                        if resultado['status'] == 'sucesso':
                            self._set_api_headers(201) 
                            self.wfile.write(json.dumps({"status": "sucesso", "mensagem": "Filme adicionado com sucesso."}).encode('utf-8'))
                        else:
                            raise Exception(resultado['mensagem'])
                    
                    else:
                        # usuário comum, cria uma solicitação
                        print(f"DEBUG: Usuário {payload['user_id']} solicitando adição.")
                        resultado = _criar_solicitacao(
                            usuario_id=payload['user_id'],
                            tipo_acao='ADICAO',
                            filme_id=None,
                            dados_propostos_json=json.dumps(dados_filme),
                            conn=conn
                        )
                        if resultado['status'] == 'sucesso':
                            self._set_api_headers(202)
                            self.wfile.write(json.dumps({"status": "sucesso", "mensagem": "Solicitação de adição enviada para aprovação."}).encode('utf-8'))
                        else:
                            raise Exception(resultado['mensagem'])
                
                except Exception as e:
                    # erro ao processar adição
                    self._set_api_headers(500)
                    self.wfile.write(json.dumps({"status": "erro", "mensagem": f"Falha no servidor: {e}"}).encode('utf-8'))
                return 
            
            # --- EDITAR FILME ---
            elif path.startswith('/filme/editar/'):
                payload = self._validar_jwt() #autenticação
                if not payload:
                    return 
                
                try:
                    filme_id = int(path.split('/')[-1]) # pega id do filme na URL
                    dados_filme = json.loads(self._get_request_body())

                    if payload['role'] == 'admin':
                        # admin, executa diretamente
                        print(f"DEBUG: Admin editando filme {filme_id} diretamente.")
                        resultado = _executar_edicao_filme(filme_id, dados_filme, conn)
                        if resultado['status'] == 'sucesso':
                            self._set_api_headers(200)
                            self.wfile.write(json.dumps({"status": "sucesso", "mensagem": "Filme editado com sucesso."}).encode('utf-8'))
                        else:
                            raise Exception(resultado['mensagem'])
                    
                    else:
                        # usuário comum, cria uma solicitação
                        print(f"DEBUG: Usuário {payload['user_id']} solicitando edição do filme {filme_id}.")
                        resultado = _criar_solicitacao(
                            usuario_id=payload['user_id'],
                            tipo_acao='EDICAO',
                            filme_id=filme_id,
                            dados_propostos_json=json.dumps(dados_filme),
                            conn=conn
                        )
                        if resultado['status'] == 'sucesso':
                            self._set_api_headers(202)
                            self.wfile.write(json.dumps({"status": "sucesso", "mensagem": "Solicitação de edição enviada para aprovação."}).encode('utf-8'))
                        else:
                            raise Exception(resultado['mensagem'])
                
                except Exception as e:
                    # erro durante edição
                    self._set_api_headers(500)
                    self.wfile.write(json.dumps({"status": "erro", "mensagem": f"Falha no servidor: {e}"}).encode('utf-8'))
                return 

            # --- APROVAR SOLICITAÇÃO ---
            elif path.startswith('/admin/solicitacao/aprovar/'):
                payload = self._validar_jwt_e_role('admin') # verifica se é admin
                if not payload:
                    return 

                try:
                    solicitacao_id = int(path.split('/')[-1])
                    print(f"DEBUG: Admin {payload['user_id']} tentando aprovar sol_id {solicitacao_id}.")

                    resultado = _processar_aprovacao(solicitacao_id, conn) 
                    
                    if resultado['status'] == 'sucesso':
                        self._set_api_headers(200)
                        self.wfile.write(json.dumps(resultado).encode('utf-8'))
                    else:
                        raise Exception(resultado['mensagem'])
                
                except Exception as e:
                    # erro durante aprovação
                    self._set_api_headers(500)
                    self.wfile.write(json.dumps({"status": "erro", "mensagem": f"Falha ao aprovar: {e}"}).encode('utf-8'))
                return 

            # --- REJEITAR SOLICITAÇÃO ---
            elif path.startswith('/admin/solicitacao/rejeitar/'):
                payload = self._validar_jwt_e_role('admin')
                if not payload:
                    return
                
                try:
                    solicitacao_id = int(path.split('/')[-1])
                    print(f"DEBUG: Admin {payload['user_id']} rejeitando sol_id {solicitacao_id}.")
                    
                    # apenas atualiza o status e commita
                    resultado = _atualizar_status_solicitacao(solicitacao_id, 'REJEITADA', conn)
                    
                    if resultado:
                        conn.commit()
                        self._set_api_headers(200)
                        self.wfile.write(json.dumps({"status": "sucesso", "mensagem": "Solicitação rejeitada."}).encode('utf-8'))
                    else:
                        raise Exception("Falha ao atualizar status no banco.")

                except Exception as e:
                    # rollback em caso de erro
                    conn.rollback()
                    self._set_api_headers(500)
                    self.wfile.write(json.dumps({"status": "erro", "mensagem": f"Falha ao rejeitar: {e}"}).encode('utf-8'))
                return 
            
            # --- ROTA NÃO EXISTE ---
            else:
                self._set_api_headers(404)
                self.wfile.write(json.dumps({"status": "erro", "mensagem": "Rota POST não encontrada."}).encode('utf-8'))

        except Exception as e:
            # captura exceções não tratadas
            import traceback
            print(f"ERRO CRÍTICO NÃO TRATADO NO DO_POST (path: {path}): {e}")
            traceback.print_exc()
            try:
                conn.rollback()  # tenta desfazer alterações
            except Exception as rb_e:
                print(f"Erro ao tentar fazer rollback: {rb_e}")
                
            self._set_api_headers(500)
            self.wfile.write(json.dumps({"status": "erro", "mensagem": f"Falha interna grave no servidor: {e}"}).encode('utf-8'))
        
        finally:
            # sempre fecha a conexão no final
            if conn:
                conn.close()


    # =====================
    # requisições do método PUT
    # =====================
    def do_PUT(self):
        parsed_path = urlparse(self.path)
        path = parsed_path.path

        # --- EDIÇÃO DE FILME ---
        if path.startswith('/filme/editar/'):
            user_info = self.validar_autenticacao()
            if not user_info:
                return 

            if user_info['role'] != 'admin':
                 # somente admins podem editar
                self._set_api_headers(403)
                self.wfile.write(json.dumps({"status": "erro", "mensagem": "Acesso negado. Apenas administradores podem editar filmes."}).encode('utf-8'))
                return
            
            # lE o corpo da requisição
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
                filme_id = int(path.split('/')[-1])
            except ValueError:
                self._set_api_headers(400)
                self.wfile.write(json.dumps({"status": "erro", "mensagem": "ID do filme inválido na URL."}).encode('utf-8'))
                return

            try:
                # pega todos os campos do corpo da requisição
                titulo = str(form_data.get('titulo', '')).strip()
                sinopse = str(form_data.get('sinopse', '')).strip()
                tempo_duracao_str = str(form_data.get('tempo_duracao', '')).strip()
                ano_str = str(form_data.get('ano', '')).strip()
                url_poster = str(form_data.get('url_poster', '')).strip()
                url_banner = str(form_data.get('url_banner', '')).strip()
                codigo_trailer = str(form_data.get('codigo_trailer', '')).strip()
                atores_nomes = form_data.get('atores', []) 
                
                generos_ids = form_data.get('generos', []) 
                diretores_ids = form_data.get('diretores', [])
                produtoras_ids = form_data.get('produtoras', [])

                # converte duração para inteiro
                try:
                    tempo_duracao = int(tempo_duracao_str.replace('min', '').strip()) if tempo_duracao_str else 0
                except:
                    tempo_duracao = 0

                # converte ano para inteiro
                try:
                    ano = int(ano_str)
                except:
                    ano = 0

                conn = get_db_connection()
                if not conn:
                    self._set_api_headers(500)
                    self.wfile.write(json.dumps({"status": "erro", "mensagem": "Erro na conexão com o banco."}).encode('utf-8'))
                    return

                try:
                    cursor = conn.cursor()

                    # --- Atualiza dados do filme ---
                    sql_update_filme = """
                    UPDATE filme SET titulo=%s, sinopse=%s, tempo_duracao=%s, ano=%s, poster=%s, background=%s, trailer=%s
                    WHERE id=%s
                    """
                    cursor.execute(sql_update_filme, (
                        titulo, sinopse, tempo_duracao, ano, url_poster, url_banner, codigo_trailer, filme_id
                    ))

                    # atualiza relacionamentos (gêneros, produtoras, diretores, atores)
                    
                    cursor.execute("DELETE FROM filme_genero WHERE filme_id=%s", (filme_id,))
                    if isinstance(generos_ids, list):
                        for genero_id in generos_ids:
                            #tenta garantir que o ID é um inteiro antes de inserir
                            try:
                                if int(genero_id) > 0:
                                    cursor.execute("INSERT INTO filme_genero (filme_id, genero_id) VALUES (%s, %s)", (filme_id, int(genero_id)))
                            except:
                                pass #ignora IDs inválidos
                    
                    cursor.execute("DELETE FROM filme_produtora WHERE filme_id=%s", (filme_id,))
                    if isinstance(produtoras_ids, list):
                        for produtora_id in produtoras_ids:
                            try:
                                if int(produtora_id) > 0: 
                                    cursor.execute("INSERT INTO filme_produtora (filme_id, produtora_id) VALUES (%s, %s)", (filme_id, int(produtora_id)))
                            except:
                                pass
                    
                    cursor.execute("DELETE FROM filme_diretor WHERE filme_id=%s", (filme_id,))
                    if isinstance(diretores_ids, list):
                        for diretor_id in diretores_ids:
                            try:
                                if int(diretor_id) > 0: 
                                    cursor.execute("INSERT INTO filme_diretor (filme_id, diretor_id) VALUES (%s, %s)", (filme_id, int(diretor_id)))
                            except:
                                pass
                        
                    cursor.execute("DELETE FROM filme_ator WHERE filme_id=%s", (filme_id,))
                    if isinstance(atores_nomes, list):
                        for ator_nome in atores_nomes:
                            if isinstance(ator_nome, str) and ator_nome.strip():
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
        
        else:
            # rota PUT não encontrada
            self._set_api_headers(404)
            self.wfile.write(json.dumps({"status": "erro", "mensagem": "Rota PUT não encontrada"}).encode('utf-8'))


    # =====================
    # requisições do método delete
    # =====================
    def do_DELETE(self):
        parsed_path = urlparse(self.path)
        path = parsed_path.path

        if path.startswith('/filme/deletar/'):
            # autenticação e permissão para o adm
            user_payload = self._validar_jwt_e_role('admin') 
            if not user_payload:
                return
            try:
                filme_id = int(path.split('/')[-1])
            except ValueError:
                self._set_api_headers(400)
                self.wfile.write(json.dumps({"status": "erro", "mensagem": "ID do filme inválido na URL."}).encode('utf-8'))
                return

            try:
                filme_id = int(path.split('/')[-1])
                resposta_json = deletar_filme(filme_id)

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
        else:
            # rota DELETE não encontrada
            self._set_api_headers(404)
            self.wfile.write(json.dumps({"status": "erro", "mensagem": "Rota DELETE não encontrada."}).encode('utf-8'))

# --- INICIALIZAÇÃO DO SERVIDOR ---
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