// Interactive search functionality with alphabet index
document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('searchInput');
    const glossaryGrid = document.getElementById('glossaryGrid');
    const termCards = document.querySelectorAll('.term-card');
    const noResults = document.getElementById('noResults');
    const letterButtons = document.querySelectorAll('.letter-btn');
    
    let currentFilter = 'todos'; // Track current filter

    // Initialize letter counts and availability
    function initializeAlphabetIndex() {
        const letterCounts = {};
        
        // Count terms for each letter
        termCards.forEach(card => {
            const firstLetter = card.getAttribute('data-first-letter');
            letterCounts[firstLetter] = (letterCounts[firstLetter] || 0) + 1;
        });
        
        // Update button states and counts
        letterButtons.forEach(button => {
            const letter = button.getAttribute('data-letter');
            
            if (letter === 'todos') {
                button.setAttribute('data-count', termCards.length);
            } else {
                const count = letterCounts[letter] || 0;
                button.setAttribute('data-count', count);
                
                if (count === 0) {
                    button.classList.add('disabled');
                    button.disabled = true;
                }
            }
        });
    }

    // Filter by letter
    function filterByLetter(selectedLetter) {
        currentFilter = selectedLetter;
        let visibleCards = 0;
        
        // Clear search input when filtering by letter
        if (selectedLetter !== 'todos') {
            searchInput.value = '';
        }

        termCards.forEach(card => {
            const cardLetter = card.getAttribute('data-first-letter');
            const shouldShow = selectedLetter === 'todos' || cardLetter === selectedLetter;

            if (shouldShow) {
                card.classList.remove('hidden');
                card.style.display = 'block';
                visibleCards++;
            } else {
                card.classList.add('hidden');
                setTimeout(() => {
                    if (card.classList.contains('hidden')) {
                        card.style.display = 'none';
                    }
                }, 300);
            }
        });

        // Update active button
        letterButtons.forEach(btn => {
            btn.classList.remove('active');
            if (btn.getAttribute('data-letter') === selectedLetter) {
                btn.classList.add('active');
            }
        });

        // Show/hide no results
        updateNoResults(visibleCards, selectedLetter !== 'todos' ? `letra ${selectedLetter}` : '');
        
        // Update URL
        updateURL(selectedLetter, '');
    }

    // Search functionality focused on Spanish content
    function performSearch(searchTerm) {
        const query = searchTerm.toLowerCase().trim();
        let visibleCards = 0;

        // If there's a search term, reset letter filter
        if (query) {
            currentFilter = 'todos';
            letterButtons.forEach(btn => {
                btn.classList.remove('active');
                if (btn.getAttribute('data-letter') === 'todos') {
                    btn.classList.add('active');
                }
            });
        }

        termCards.forEach(card => {
            const searchData = card.getAttribute('data-term').toLowerCase();
            const cardLetter = card.getAttribute('data-first-letter');
            
            // Extract Spanish content for better search
            const meaningElement = card.querySelector('.meaning');
            const basicMeaningElement = card.querySelector('.basic-meaning');
            const explanationElement = card.querySelector('.explanation');
            
            const meaning = meaningElement ? meaningElement.textContent.toLowerCase() : '';
            const basicMeaning = basicMeaningElement ? basicMeaningElement.textContent.toLowerCase() : '';
            const explanation = explanationElement ? explanationElement.textContent.toLowerCase() : '';
            
            // Search in keywords (data-term) and Spanish content
            const matchesSearch = query === '' || 
                                searchData.includes(query) ||
                                meaning.includes(query) ||
                                basicMeaning.includes(query) ||
                                explanation.includes(query);
            
            const matchesLetter = currentFilter === 'todos' || 
                                cardLetter === currentFilter;

            const shouldShow = matchesSearch && matchesLetter;

            if (shouldShow) {
                card.classList.remove('hidden');
                card.style.display = 'block';
                visibleCards++;
            } else {
                card.classList.add('hidden');
                setTimeout(() => {
                    if (card.classList.contains('hidden')) {
                        card.style.display = 'none';
                    }
                }, 300);
            }
        });

        updateNoResults(visibleCards, query);
        updateURL(currentFilter, query);
    }

    // Update no results message
    function updateNoResults(visibleCards, searchContext) {
        if (visibleCards === 0 && searchContext) {
            noResults.style.display = 'block';
            glossaryGrid.style.display = 'none';
            
            const message = searchContext.startsWith('letra') 
                ? `No hay términos que comiencen con la ${searchContext}.`
                : `No se encontraron términos que coincidan con "${searchContext}".`;
            
            noResults.querySelector('p').textContent = message;
        } else {
            noResults.style.display = 'none';
            glossaryGrid.style.display = 'grid';
        }
    }

    // Update URL with current state
    function updateURL(letter, search) {
        const url = new URL(window.location);
        
        if (letter !== 'todos') {
            url.searchParams.set('letter', letter);
        } else {
            url.searchParams.delete('letter');
        }
        
        if (search) {
            url.searchParams.set('search', search);
        } else {
            url.searchParams.delete('search');
        }
        
        window.history.replaceState({}, '', url);
    }

    // Letter button click handlers
    letterButtons.forEach(button => {
        button.addEventListener('click', function() {
            if (this.disabled) return;
            
            const selectedLetter = this.getAttribute('data-letter');
            filterByLetter(selectedLetter);
            
            // Smooth scroll to top
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    });

    // Real-time search
    searchInput.addEventListener('input', function() {
        performSearch(this.value);
    });

    // Handle page load with URL parameters
    function handleInitialState() {
        const urlParams = new URLSearchParams(window.location.search);
        const initialLetter = urlParams.get('letter') || 'todos';
        const initialSearch = urlParams.get('search') || '';
        
        if (initialSearch) {
            searchInput.value = initialSearch;
            performSearch(initialSearch);
        } else if (initialLetter !== 'todos') {
            filterByLetter(initialLetter);
        }
    }

    // Keyboard shortcuts
    document.addEventListener('keydown', function(event) {
        // Focus search input on Ctrl/Cmd + F
        if ((event.ctrlKey || event.metaKey) && event.key === 'f') {
            event.preventDefault();
            searchInput.focus();
        }

        // Clear search on Escape
        if (event.key === 'Escape' && searchInput === document.activeElement) {
            searchInput.value = '';
            performSearch('');
        }

        // Number keys for quick letter selection
        if (event.key >= '1' && event.key <= '9') {
            const buttonIndex = parseInt(event.key) - 1;
            const button = letterButtons[buttonIndex];
            if (button && !button.disabled) {
                button.click();
            }
        }
    });

    // Enhanced term card interactions
    termCards.forEach(card => {
        card.addEventListener('click', function(event) {
            // Double click for quick search
            if (event.detail === 2) {
                const greekTerm = card.querySelector('.greek-term').textContent;
                searchInput.value = greekTerm;
                performSearch(greekTerm);
                searchInput.focus();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });

        // Hover effects
        card.addEventListener('mouseenter', function() {
            this.style.cursor = 'pointer';
        });

        // Keyboard navigation for cards
        card.setAttribute('tabindex', '0');
        card.addEventListener('keydown', function(event) {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                const greekTerm = this.querySelector('.greek-term').textContent;
                searchInput.value = greekTerm;
                performSearch(greekTerm);
                searchInput.focus();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });
    });

    // Intersection Observer for scroll animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    termCards.forEach(card => {
        observer.observe(card);
    });

    // Performance optimizations
    let searchTimeout;
    function debouncedSearch() {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            performSearch(searchInput.value);
        }, 150);
    }

    // Replace direct search with debounced version for better performance
    searchInput.removeEventListener('input', performSearch);
    searchInput.addEventListener('input', debouncedSearch);

    // Analytics tracking
    function trackInteraction(action, details = {}) {
        // Placeholder for analytics
        console.log(`User interaction: ${action}`, details);
    }

    // Track letter filter usage
    letterButtons.forEach(button => {
        button.addEventListener('click', function() {
            trackInteraction('letter_filter', {
                letter: this.getAttribute('data-letter'),
                count: this.getAttribute('data-count')
            });
        });
    });

    // Track search usage
    searchInput.addEventListener('input', function() {
        if (this.value.length > 2) {
            trackInteraction('search', { query: this.value });
        }
    });

    // Initialize the application
    initializeAlphabetIndex();
    handleInitialState();
    
    console.log('Glosario interactivo con índice alfabético cargado correctamente');
});

    // Image loading and error handling
    function initializeImages() {
        const images = document.querySelectorAll('.concept-image');
        
        images.forEach(image => {
            // Handle successful image load
            image.addEventListener('load', function() {
                const placeholder = this.nextElementSibling;
                if (placeholder && placeholder.classList.contains('image-placeholder')) {
                    placeholder.style.opacity = '0';
                    placeholder.style.pointerEvents = 'none';
                }
            });
            
            // Handle image load error
            image.addEventListener('error', function() {
                const placeholder = this.nextElementSibling;
                if (placeholder && placeholder.classList.contains('image-placeholder')) {
                    placeholder.style.opacity = '1';
                    placeholder.style.pointerEvents = 'auto';
                }
                this.style.opacity = '0';
            });
            
            // Check if image is already loaded (for cached images)
            if (image.complete) {
                if (image.naturalHeight !== 0) {
                    image.dispatchEvent(new Event('load'));
                } else {
                    image.dispatchEvent(new Event('error'));
                }
            }
        });
    }
    
    // Add image initialization to the main initialization
    initializeAlphabetIndex();
    handleInitialState();
    initializeImages();
