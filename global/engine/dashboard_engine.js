// global/engine/dashboard_engine.js

const dashboardEngine = {
    // 1. Initialize the Dashboard Block
    init: function(containerId, cardData, logicConfig) {
        const container = document.getElementById(containerId);
        if (!container) return;

        // Create the grid wrapper
        const grid = document.createElement('div');
        
        // Apply responsive logic from Column C
        // Default to 'grid-smart' if nothing is specified
        const gridStyle = logicConfig || 'grid-smart';
        grid.className = `category-grid ${gridStyle}`;

        cardData.forEach(card => {
            const cardLink = card['Data 1'] || '#';
            const cardTitle = card['Data 2'] || 'Namnlös';
            const cardDesc = card['Data 3'] || '';
            const cardIcon = card['Data 4'] || '📄';

            // Create the HTML structure for the "Smart Card"
            const cardAnchor = document.createElement('a');
            cardAnchor.href = cardLink;
            cardAnchor.className = 'category-card';

            cardAnchor.innerHTML = `
                <div class="card-icon">${cardIcon}</div>
                <div class="card-info">
                    <h3>${cardTitle}</h3>
                    <p>${cardDesc}</p>
                </div>
            `;

            grid.appendChild(cardAnchor);
        });

        container.appendChild(grid);
    }
};