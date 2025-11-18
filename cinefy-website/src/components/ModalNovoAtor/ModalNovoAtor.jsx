import React, { useState } from "react";
import "./ModalNovoAtor.css";

const ModalNovoAtor = ({ open, onClose, onSaved, initialName }) => {
    // Inicializa com o initialName
    const [nome, setNome] = useState(initialName || ""); 
    const [foto, setFoto] = useState("");

    if (!open) return null;

    // Atualiza o estado interno 'nome' quando o modal abre com um novo initialName
    useEffect(() => {
        if (open) {
            setNome(initialName || "");
            setFoto(""); // Garante que a foto é limpa ao reabrir
        }
    }, [open, initialName]);

    function salvar() {
        // Endpoint de adição (POST)
        fetch("http://localhost:8000/atores/adicionar", {
            method: "POST",
            body: new URLSearchParams({ nome, foto }),
            // ATENÇÃO: Se for JSON, você precisará: 
            // headers: { 'Content-Type': 'application/json' },
            // body: JSON.stringify({ nome, foto })
        })
            .then(res => res.json())
            .then(data => {
                // Chama a função passada pelo AdicionarFilme (handleNewActorSaved)
                onSaved(data); 
            })
            .catch(err => {
                console.error("Erro ao salvar ator:", err);
                // Opcional: Mostrar erro para o usuário
            });
    }
    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>Novo Ator</h2>

                <label>Nome</label>
                <input value={nome} onChange={e => setNome(e.target.value)} />

                <label>URL da imagem</label>
                <input value={foto} onChange={e => setFoto(e.target.value)} />

                {foto ? (
                    <img src={foto} className="modal-preview" alt="preview" />
                ) : null}

                <div className="modal-buttons">
                    <button onClick={onClose}>Cancelar</button>
                    <button onClick={salvar} className="save-btn">Salvar</button>
                </div>
            </div>
        </div>
    );
};

export default ModalNovoAtor;
