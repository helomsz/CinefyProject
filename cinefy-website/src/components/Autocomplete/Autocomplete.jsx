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
    }, [fetchUrl]);

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
    
    const filteredOptions = options.filter(opt => {
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
                value={value && !search ? value.nome : search} 
                onFocus={() => setOpen(true)}
                onChange={(e) => {
                    const newValue = e.target.value;
                    setSearch(newValue);
                    onChange(null); 
                    setOpen(true);
                }}
                placeholder={`Selecione ${(label || '').toLowerCase()}`} 
            />

            {open && (
                <div className="aut-dropdown">
                    {filteredOptions.length === 0 && allowAddNew && search.trim() !== "" ? (
                        <div className="aut-add-new" onClick={() => onAddNew(search)}>
                             Criar novo: <strong>{search}</strong>
                        </div>
                    ) : null}
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