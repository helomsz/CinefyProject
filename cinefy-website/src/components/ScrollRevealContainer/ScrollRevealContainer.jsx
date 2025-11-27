
import React, { useRef, useState, useEffect } from 'react';
import './ScrollRevealContainer.css';

/**
 * @param {string} animationType 
 * @param {object} children 
 */
function ScrollRevealContainer({ animationType = 'fade-in', children }) {
    // controla quando o elemento ja ficou visivel na tela
    const [isVisible, setIsVisible] = useState(false);
    const elementRef = useRef(null);  // referencia para observar o elemento

    useEffect(() => {
        // cria o observer para detectar quando o item entra na viewport
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true); // marca como visível
                    observer.unobserve(entry.target); // para observar depois que já revelou
                }
            },
            {
                root: null, // usa viewport padrão
                rootMargin: '0px',
                threshold: 0.1, // só aciona quando pelo menos 10% aparecer
            }
        );

        if (elementRef.current) {
            observer.observe(elementRef.current); // começa a observar o elemento
        }

        return () => {
            if (elementRef.current) {
                observer.unobserve(elementRef.current);
            }
        };
    }, []);

    // monta as classes com base na animação e visibilidade
    const classes = `scroll-reveal ${animationType} ${isVisible ? 'visible' : ''}`;

    return (
        <div ref={elementRef} className={classes}>
            {children}
        </div>
    );
}

export default ScrollRevealContainer;