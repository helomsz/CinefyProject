
import React, { useRef, useState, useEffect } from 'react';
import './ScrollRevealContainer.css';

/**
 * @param {string} animationType 
 * @param {object} children 
 */
function ScrollRevealContainer({ animationType = 'fade-in', children }) {
    const [isVisible, setIsVisible] = useState(false);
    const elementRef = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                // Se o elemento estiver visível (ou seja, entry.isIntersecting for true)
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    // Opcional: Para que a animação ocorra apenas uma vez.
                    observer.unobserve(entry.target);
                }
            },
            {
                // Configurações do observador
                root: null, // Observa em relação à viewport
                rootMargin: '0px',
                threshold: 0.1, // Ação dispara quando 10% do elemento estiver visível
            }
        );

        if (elementRef.current) {
            observer.observe(elementRef.current);
        }

        // Cleanup: Desconecta o observador quando o componente é desmontado
        return () => {
            if (elementRef.current) {
                observer.unobserve(elementRef.current);
            }
        };
    }, []);

    const classes = `scroll-reveal ${animationType} ${isVisible ? 'visible' : ''}`;

    return (
        <div ref={elementRef} className={classes}>
            {children}
        </div>
    );
}

export default ScrollRevealContainer;