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

    // busca dados do backend
    useEffect(() => {
        if (!fetchUrl) return;
        fetch(fetchUrl)
            .then(res => res.json())
            .then(data => setOptions(Array.isArray(data) ? data : []))
            .catch(err => console.error("Erro autocomplete:", err));
    }, [fetchUrl]); // só roda novamente quando a URL de fetch mudar


    // fecha dropdown ao clicar fora
    useEffect(() => {
        function handleClickOutside(e) {
            if (ref.current && !ref.current.contains(e.target)) {
                setOpen(false);
            }
        }
        window.addEventListener("mousedown", handleClickOutside);
        return () => window.removeEventListener("mousedown", handleClickOutside);
    }, []);


    const searchValue = (search || '').toLowerCase(); 

    // filtrando as opções com base no valor digitado
    const filteredOptions = options.filter(opt => {
        const nome = opt?.nome || '';
        return nome.toLowerCase().includes(searchValue); // verifica se o nome inclui a pesquisa
    });

    return (
        <div className="autocomplete-container" ref={ref}> {/* container do componente */}
            <label className="aut-label">
                {icon} {label}
            </label>

            <input
                className="aut-input"
                value={value && !search ? value.nome : search} 
                onFocus={() => setOpen(true)} // abre o dropdown quando o input é focado
                onChange={(e) => {
                    const newValue = e.target.value;
                    setSearch(newValue);
                    onChange(null); 
                    setOpen(true); // abre o dropdown
                }}
                placeholder={`Selecione ${(label || '').toLowerCase()}`} 
            />

            {open && ( // exibe o dropdown apenas se "open" for true
                <div className="aut-dropdown">
                    {filteredOptions.length === 0 && allowAddNew && search.trim() !== "" ? (
                        <div className="aut-add-new" onClick={() => onAddNew(search)}>
                             Criar novo: <strong>{search}</strong>
                        </div>
                    ) : null}
                    {filteredOptions.map(op => ( // mapeia as opções filtradas e exibe cada uma
                        <div
                            key={op.id}
                            className="aut-item"
                            onClick={() => {  // ao clicar, seleciona a opção
                                onChange(op); 
                                setSearch(op.nome);
                                setOpen(false);
                            }}
                        >
                            {showImage && op.fotoAtor ? ( // se for pra mostrar a imagem e a opção tiver foto
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