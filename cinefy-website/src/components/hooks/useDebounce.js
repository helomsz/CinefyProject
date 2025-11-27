
import { useState, useEffect } from 'react';

function useDebounce(value, delay) {
  // hook para guardar o valor atual já com debounce aplicado
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    // cria um timeout para atualizar o valor depois do delay informado
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    // limpa o timeout anterior quando value ou delay mudam
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]); // dependências para recriar o efeito

  return debouncedValue;
}

export default useDebounce;