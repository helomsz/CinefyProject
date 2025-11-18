// src/hooks/useDebounce.js

import { useState, useEffect } from 'react';

// O hook recebe o valor (termoPesquisa) e o atraso (500ms é um bom padrão)
function useDebounce(value, delay) {
  // Estado para armazenar o valor 'debounced'
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    // 1. Cria um timer que só atualiza o estado após o 'delay'
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // 2. Cleanup: Se o usuário digitar novamente antes do 'delay',
    // o timer anterior é cancelado e um novo é criado.
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]); // Roda sempre que o 'value' ou 'delay' mudar

  return debouncedValue;
}

export default useDebounce;