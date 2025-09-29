// Interactive search functionality
document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('searchInput');
    const glossaryGrid = document.getElementById('glossaryGrid');
    const termCards = document.querySelectorAll('.term-card');
    const noResults = document.getElementById('noResults');

    // Search functionality
    function performSearch(searchTerm) {
        const query = searchTerm.toLowerCase().trim();
        let visibleCards = 0;

        termCards.forEach(card => {
            const searchData = card.getAttribute('data-term').toLowerCase();
            const cardText = card.textContent.toLowerCase();
            
            const isMatch = searchData.includes(query) || 
                          cardText.includes(query) || 
                          query === '';

            if (isMatch) {
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

        // Show/hide no results message
        if (visibleCards === 0 && query !== '') {
            noResults.style.display = 'block';
            glossaryGrid.style.display = 'none';
        } else {
            noResults.style.display = 'none';
            glossaryGrid.style.display = 'grid';
        }

        // Update URL with search parameter
        const url = new URL(window.location);
        if (query) {
            url.searchParams.set('search', query);
        } else {
            url.searchParams.delete('search');
        }
        window.history.replaceState({}, '', url);
    }

    // Real-time search
    searchInput.addEventListener('input', function() {
        performSearch(this.value);
    });

    // Handle search on page load (if URL contains search parameter)
    const urlParams = new URLSearchParams(window.location.search);
    const initialSearch = urlParams.get('search');
    if (initialSearch) {
        searchInput.value = initialSearch;
        performSearch(initialSearch);
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
    });

    // Smooth scroll for better UX
    function smoothScrollToTop() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }

    // Add click handlers for term cards
    termCards.forEach(card => {
        card.addEventListener('click', function(event) {
            // Only add interactivity if clicked on the card itself, not on text selection
            if (event.detail === 2) { // Double click
                const greekTerm = card.querySelector('.greek-term').textContent;
                searchInput.value = greekTerm;
                performSearch(greekTerm);
                smoothScrollToTop();
            }
        });

        // Add hover effect for better interactivity indication
        card.addEventListener('mouseenter', function() {
            this.style.cursor = 'pointer';
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

    // Observe all term cards for scroll animations
    termCards.forEach(card => {
        observer.observe(card);
    });

    // Add loading state for better UX
    function showLoadingState() {
        termCards.forEach(card => {
            card.style.opacity = '0.6';
            card.style.pointerEvents = 'none';
        });
    }

    function hideLoadingState() {
        termCards.forEach(card => {
            card.style.opacity = '1';
            card.style.pointerEvents = 'auto';
        });
    }

    // Debounce search for better performance
    let searchTimeout;
    const originalInputHandler = searchInput.oninput;
    
    searchInput.oninput = function() {
        clearTimeout(searchTimeout);
        showLoadingState();
        
        searchTimeout = setTimeout(() => {
            performSearch(this.value);
            hideLoadingState();
        }, 150);
    };

    // Add keyboard navigation for accessibility
    searchInput.addEventListener('keydown', function(event) {
        if (event.key === 'ArrowDown') {
            event.preventDefault();
            const firstVisibleCard = document.querySelector('.term-card:not(.hidden)');
            if (firstVisibleCard) {
                firstVisibleCard.focus();
            }
        }
    });

    // Make term cards focusable and navigable
    termCards.forEach((card, index) => {
        card.setAttribute('tabindex', '0');
        
        card.addEventListener('keydown', function(event) {
            if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
                event.preventDefault();
                const nextCard = this.nextElementSibling;
                if (nextCard && !nextCard.classList.contains('hidden')) {
                    nextCard.focus();
                }
            } else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') {
                event.preventDefault();
                const prevCard = this.previousElementSibling;
                if (prevCard && !prevCard.classList.contains('hidden')) {
                    prevCard.focus();
                } else {
                    searchInput.focus();
                }
            } else if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                const greekTerm = this.querySelector('.greek-term').textContent;
                searchInput.value = greekTerm;
                performSearch(greekTerm);
                searchInput.focus();
                smoothScrollToTop();
            }
        });
    });

    // Add visual feedback for interactions
    termCards.forEach(card => {
        card.addEventListener('focus', function() {
            this.style.outline = '2px solid var(--accent-color)';
            this.style.outlineOffset = '2px';
        });

        card.addEventListener('blur', function() {
            this.style.outline = 'none';
        });
    });

    // Performance optimization: Virtual scrolling for large datasets
    // (Currently not needed with 9 terms, but ready for expansion)
    
    // Analytics and user experience tracking (placeholder)
    function trackUserInteraction(action, term = null) {
        // This would be where you'd send analytics data
        console.log(`User interaction: ${action}`, term ? `Term: ${term}` : '');
    }

    // Track search interactions
    searchInput.addEventListener('input', function() {
        if (this.value.length > 2) {
            trackUserInteraction('search', this.value);
        }
    });

    // Track term card interactions
    termCards.forEach(card => {
        card.addEventListener('click', function() {
            const term = this.querySelector('.greek-term').textContent;
            trackUserInteraction('term_click', term);
        });
    });

    console.log('Glosario interactivo cargado correctamente');
});
