import React, { useState, useEffect, useRef } from "react";
import "./Autocomplete.css";

const Autocomplete = ({
    label,
    icon,
    value,
    onChange,
    fetchUrl,
    allowAddNew = false,
    onAddNew,
    showImage = false
}) => {
    const [search, setSearch] = useState("");
    const [options, setOptions] = useState([]);
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    // Buscar dados do backend
    useEffect(() => {
        if (!fetchUrl) return;
        fetch(fetchUrl)
            .then(res => res.json())
            .then(data => setOptions(Array.isArray(data) ? data : []))
            .catch(err => console.error("Erro autocomplete:", err));
    }, [fetchUrl]);

    // Fechar dropdown ao clicar fora
    useEffect(() => {
        function handleClickOutside(e) {
            if (ref.current && !ref.current.contains(e.target)) {
                setOpen(false);
            }
        }
        window.addEventListener("mousedown", handleClickOutside);
        return () => window.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Filtrar opções
    // 👇 ALTERAÇÃO AQUI (Linha 52 - Garante que 'search' é uma string antes de chamar toLowerCase)
    const searchValue = (search || '').toLowerCase(); 
    
    const filteredOptions = options.filter(opt => {
        // Acessa opt.nome e garante que não é null/undefined antes de chamar toLowerCase
        const nome = opt?.nome || '';
        return nome.toLowerCase().includes(searchValue);
    });

    return (
        <div className="autocomplete-container" ref={ref}>
            <label className="aut-label">
                {icon} {label}
            </label>

            <input
                className="aut-input"
                // Se um 'value' estiver selecionado, mostre o nome dele, 
                // caso contrário, use o que o usuário está digitando ('search')
                value={value && !search ? value.nome : search} 
                onFocus={() => setOpen(true)}
                onChange={(e) => {
                    const newValue = e.target.value;
                    setSearch(newValue);
                    // Reseta o valor selecionado (value) para null quando o usuário começa a digitar
                    // Isso força o Autocomplete a procurar na lista e não ficar "preso" no valor anterior
                    onChange(null); 
                    setOpen(true);
                }}
                placeholder={`Selecione ${(label || '').toLowerCase()}`} 
            />

            {open && (
                <div className="aut-dropdown">
                    {/* Usando filteredOptions.length */}
                    {filteredOptions.length === 0 && allowAddNew && search.trim() !== "" ? (
                        <div className="aut-add-new" onClick={() => onAddNew(search)}>
                            ➕ Criar novo: <strong>{search}</strong>
                        </div>
                    ) : null}

                    {/* Usando filteredOptions.map */}
                    {filteredOptions.map(op => (
                        <div
                            key={op.id}
                            className="aut-item"
                            onClick={() => {
                                onChange(op);
                                setSearch(op.nome);
                                setOpen(false);
                            }}
                        >
                            {showImage && op.fotoAtor ? (
                                <img src={op.fotoAtor} alt="" className="aut-img" />
                            ) : null}

                            {op.nome}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Autocomplete;