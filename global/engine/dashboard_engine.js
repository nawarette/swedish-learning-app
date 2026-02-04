// global/engine/dashboard_engine.js

/**
 * Dashboard Engine
 * Handles the rendering of category grids and smart cards.
 */
const dashboardEngine = {
    /**
     * Initialize and render a dashboard block.
     * @param {string} containerId - The ID of the div where the grid should be injected.
     * @param {Array} cardData - The array of card rows collected from the sheet.
     * @param {string} logicConfig - The layout style (e.g., 'grid-smart').
     */
    init: function(containerId, cardData, logicConfig) {
        const container = document.getElementById(containerId);
        if (!container) return;

        // Create the grid wrapper
        const grid = document.createElement('div');
        
        // Apply responsive logic classes
        const gridStyle = logicConfig || 'grid-smart';
        grid.className = gridStyle === 'grid-smart' ? 'category-grid' : 'dashboard-list';

        cardData.forEach(card => {
            // Data Mapping: Data 1=Link, Data 2=Title, Data 3=Desc, Data 4=Icon
            const cardLink = card['Data 1'] || '#';
            const isLocked = cardLink === '#';
            const cardAnchor = document.createElement('a');
            
            // Handle Placeholder/Locked State
            if (isLocked) {
                cardAnchor.href = 'javascript:void(0)';
                cardAnchor.className = 'category-card locked-card';
                cardAnchor.style.opacity = '0.6';
                cardAnchor.style.cursor = 'not-allowed';
                cardAnchor.style.pointerEvents = 'none';
            } else {
                cardAnchor.href = cardLink;
                cardAnchor.className = 'category-card';
            }

            // Apply strike-through <s> to text if locked
            const title = isLocked ? `<s>${card['Data 2'] || ''}</s>` : (card['Data 2'] || '');
            const desc = isLocked ? `<s>${card['Data 3'] || ''}</s>` : (card['Data 3'] || '');

            cardAnchor.innerHTML = `
                <div class="card-icon">${card['Data 4'] || '📁'}</div>
                <div class="card-info">
                    <h3>${title}</h3>
                    <p>${desc}</p>
                </div>
            `;
            grid.appendChild(cardAnchor);
        });

        container.appendChild(grid);
    }
};