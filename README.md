# 🎬 Cinefy — Catálogo de Filmes com Modo Kids

![Status](https://img.shields.io/badge/status-active-success)
![React](https://img.shields.io/badge/React-20232A?logo=react)
![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite\&logoColor=white)
![Python](https://img.shields.io/badge/Python-3776AB?logo=python\&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?logo=jsonwebtokens\&logoColor=white)
![Bcrypt](https://img.shields.io/badge/bcrypt-3385FF)
![MySQL](https://img.shields.io/badge/MySQL-005C84?logo=mysql\&logoColor=white)

---

O **Cinefy** é uma plataforma completa para exploração, consulta e gerenciamento de filmes.
Conta com área administrativa, visualização detalhada, filtros inteligentes, autenticação, criptografia de senhas, integração com banco de dados e uma tela totalmente dedicada ao público infantil: o **Cinefy Kids**.

Este repositório inclui o **Front-end (React + Vite)** e o **Back-end (Python + MySQL)**.

---

## 📁 Estrutura do Projeto

```
/CinefyProject
│
├── backend/
│   ├── app.py
│   ├── requirements.txt
│   ├── db/
│   └── routes/
│
└── frontend/
    ├── src/
    ├── public/
    ├── package.json
    └── vite.config.js
```

---

## 🧩 Tecnologias Utilizadas

### Front-end

* React + Vite
* CSS
* Fetch
* Lucide-React

### Back-end

* Python
* JWT para autenticação
* Bcrypt para criptografia de senhas
* MySQL
* HTTPServer (ou estrutura utilizada no projeto)

---

# ⚙️ Como Rodar o Projeto

## 🔧 1. Back-end (Python)

### ➤ Ativar o ambiente virtual

```bash
# Windows
venv\Scripts\activate

```

### ➤ Instalar dependências

```bash
pip install -r requirements.txt
```

### ➤ Configurar credenciais do banco

```python
DB_CONFIG = {
    'host': "localhost",
    'user': "root",
    'password': "senai",
    'database': "SERVIDORFILMES"
}
```

### ➤ Rodar o servidor

```bash
py server_api.py
```

---

## 🎨 2. Front-end (React + Vite)

### ➤ Instalar dependências

```bash
npm install
```

### ➤ Rodar o projeto

```bash
npm run dev
```

---

# 🎯 Funcionalidades

### Autenticação

* Login com JWT
* Senhas criptografadas com bcrypt
* Proteção de rotas

### Administração de Filmes

* Adicionar filmes
* Editar informações
* Remover títulos
* Visualizar detalhes

### Catálogo

* Listagem geral de filmes
* Filtros por categorias
* Busca
* Cards com pôster e título

### Página de Detalhes

* Sinopse
* Direção, categorias e duração
* Estética inspirada no Figma

### 👶 Cinefy Kids

* Interface mais colorida e lúdica
* Navegação simplificada
* Apenas filmes infantis
* Ambiente seguro para crianças

---

# 🚀 Melhorias Futuras

* Avaliações e notas
* Dark/Light mode
* Sugestões inteligentes
* Histórico do usuário

---

> Feito com muita dedicação por **Heloisa Militão de Souza** 💚



