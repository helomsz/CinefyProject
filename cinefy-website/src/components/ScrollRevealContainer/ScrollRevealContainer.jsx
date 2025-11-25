
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
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.unobserve(entry.target);
                }
            },
            {
                root: null,
                rootMargin: '0px',
                threshold: 0.1,
            }
        );

        if (elementRef.current) {
            observer.observe(elementRef.current);
        }

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