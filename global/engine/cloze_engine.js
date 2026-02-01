/* file:///Users/bentoblitzz/Documents/Playground/svenska_ovning/global/engine/cloze_engine.js 
   
   UNIVERSAL CLOZE ENGINE (Fill-in-the-blank)
   Updated: Dynamic button toggle and layout fixes.
*/

const clozeEngine = {
    currentIndex: 0,
    itemsPerPage: 10,
    data: [],
    selectionMode: false,
    activeDataLength: 0,
    storageKey: '',

    // 1. Initialize with Data and local storage key
    init: function(dataArray) {
        this.storageKey = 'cloze_filter_' + window.location.pathname;
        const savedSelections = JSON.parse(localStorage.getItem(this.storageKey)) || [];
        this.data = dataArray.map(item => ({ 
            ...item, 
            selected: savedSelections.length > 0 ? savedSelections.includes(item.id) : true 
        }));
        this.data = this.shuffleData([...this.data]);
        this.renderExercises(); 
    },

    // 2. Main Render Function
    renderExercises: function() {
        const container = document.getElementById('exercise-container');
        if (!container) return;
        container.innerHTML = '';

        if (this.selectionMode) {
            this.renderSelectionUI(container);
        } else {
            this.renderPracticeUI(container);
        }
        this.updateUI();
    },

    // 2a. Practice Mode UI
    renderPracticeUI: function(container) {
        const filteredData = this.data.filter(item => item.selected);
        this.activeDataLength = filteredData.length;
        const itemsToRender = filteredData.slice(this.currentIndex, this.currentIndex + this.itemsPerPage);
        
        if (itemsToRender.length === 0) {
            container.innerHTML = "<p style='text-align:center; padding: 20px;'>Inga meningar valda. Gå till 'Setting' för att välja nummer.</p>";
            return;
        }

        itemsToRender.forEach((item) => {
            const card = document.createElement('div');
            card.className = 'exercise-card';
            const sentenceWithInput = item.sentence.replace("___", 
                `<input type="text" class="cloze-input" autocomplete="off" data-answer="${item.answer}" onkeypress="if(event.key === 'Enter') clozeEngine.checkAnswer(this)">`
            );

            card.innerHTML = `
                <div class="exercise-content">
                    <div class="hint-row">
                        <span class="hint-badge">Ledtråd: ${item.hint}</span>
                    </div>
                    <div class="sentence-row">
                        <p class="sentence-text">${sentenceWithInput}</p>
                    </div>
                </div>
                <div class="card-controls">
                    <button class="check-btn" onclick="clozeEngine.checkAnswer(this)">Kontrollera</button>
                    <button class="show-btn" onclick="clozeEngine.showAnswer(this)">Visa svar</button>
                </div>
            `;
            container.appendChild(card);
        });
    },

    // 2b. Selection Mode UI
    renderSelectionUI: function(container) {
        const listContainer = document.createElement('div');
        listContainer.className = 'selection-list-container';

        const sortedData = [...this.data].sort((a, b) => a.id - b.id);

        sortedData.forEach((item) => {
            const row = document.createElement('div');
            row.className = 'selection-item-row';

            row.innerHTML = `
                <div style="display: flex; align-items: flex-start; gap: 15px; width: 100%;">
                    <input type="checkbox" class="selection-checkbox" style="margin-top: 5px; transform: scale(1.2);" 
                        ${item.selected ? 'checked' : ''} 
                        onchange="clozeEngine.toggleItemSelection(${item.id})">
                    <div style="flex: 1;">
                        <div class="hint-row" style="border:none; padding:0; margin-bottom: 5px;">
                            <span class="hint-badge">Ledtråd: ${item.hint}</span>
                        </div>
                        <div class="sentence-row" style="padding:0;">
                            <span style="color: #666; font-size: 0.95rem;">${item.sentence.replace("___", "______")}</span>
                        </div>
                    </div>
                </div>
            `;
            listContainer.appendChild(row);
        });
        container.appendChild(listContainer);
    },

    // 3. Selection Logic (The Dynamic Toggles)
    toggleItemSelection: function(id) {
        const item = this.data.find(d => d.id === id);
        if (item) item.selected = !item.selected;
        this.updateSelectionButtons(); // Label updates as you click individual boxes
    },

    toggleSelectAll: function() {
        const allSelected = this.data.every(item => item.selected);
        // If all are selected, we unselect all. Otherwise, we select all.
        const newState = !allSelected;
        this.data.forEach(item => item.selected = newState);
        
        this.renderExercises();
        this.updateSelectionButtons();
    },

    enterSelectionMode: function() {
        this.selectionMode = true;
        
        if(document.getElementById('restart-btn')) document.getElementById('restart-btn').style.display = 'none';
        if(document.getElementById('filter-btn')) document.getElementById('filter-btn').style.display = 'none';
        
        const saveBtn = document.getElementById('save-filter-btn');
        const cancelBtn = document.getElementById('cancel-filter-btn');
        const leftActions = document.querySelector('.left-actions');
        const rightActions = document.querySelector('.right-actions');
        const filterControls = document.querySelector('.filter-controls');

        if(saveBtn) saveBtn.style.display = 'inline-block';
        if(cancelBtn) cancelBtn.style.display = 'inline-block';

        if(filterControls && rightActions) {
            rightActions.appendChild(filterControls);
        }

        let tools = document.getElementById('selection-tools');
        if (!tools) {
            tools = document.createElement('div');
            tools.id = 'selection-tools';
            tools.style.display = 'inline-block';
            tools.style.marginLeft = '10px';
            tools.innerHTML = `<button id="select-all-btn" onclick="clozeEngine.toggleSelectAll()" style="background-color: #6c757d; color: white;">Välj alla</button>`;
            
            if(leftActions) leftActions.appendChild(tools);
        } else {
            tools.style.display = 'inline-block';
        }
        
        this.renderExercises();
        this.updateSelectionButtons();
    },

    saveSelection: function() {
        const selectedIds = this.data.filter(item => item.selected).map(item => item.id);
        localStorage.setItem(this.storageKey, JSON.stringify(selectedIds));
        this.selectionMode = false;
        location.reload(); 
    },

    // NERDY NOTE: This keeps the label accurate in real-time
    updateSelectionButtons: function() {
        const btn = document.getElementById('select-all-btn');
        if (btn) {
            const allSelected = this.data.every(item => item.selected);
            // Label shows 'Avmarkera alla' only if everything is checked
            btn.innerText = allSelected ? "Avmarkera alla" : "Välj alla";
        }
    },

    // 4. Interaction Logic
    checkAnswer: function(element) {
        const card = element.closest('.exercise-card');
        const input = card.querySelector('.cloze-input');
        if (!input) return;
        const userValue = input.value.trim().toLowerCase();
        const correctAnswer = input.getAttribute('data-answer').toLowerCase();
        if (userValue === "") {
            input.style.backgroundColor = "";
        } else if (userValue === correctAnswer) {
            input.style.backgroundColor = "#d4edda";
            input.style.color = "#155724";
        } else {
            input.style.backgroundColor = "#f8d7da";
            input.style.color = "#721c24";
        }
    },

    showAnswer: function(button) {
        const card = button.closest('.exercise-card');
        const input = card.querySelector('.cloze-input');
        if (input) {
            input.value = input.getAttribute('data-answer');
            input.style.backgroundColor = "#fff3cd";
            input.style.color = "#856404";
        }
    },

    // 5. Helpers
    shuffleData: function(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    },

    loadNextSet: function() {
        if (this.currentIndex + this.itemsPerPage < this.activeDataLength) {
            this.currentIndex += this.itemsPerPage;
            this.renderExercises();
            window.scrollTo(0,0);
        }
    },

    loadPreviousSet: function() {
        if (this.currentIndex - this.itemsPerPage >= 0) {
            this.currentIndex -= this.itemsPerPage;
            this.renderExercises();
            window.scrollTo(0,0);
        }
    },

    updateUI: function() {
        const nextBtn = document.getElementById('next-set-btn');
        const prevBtn = document.getElementById('prev-set-btn');
        const nextContainer = nextBtn ? nextBtn.parentElement : null;
        if (this.selectionMode) {
            if (nextContainer) nextContainer.style.display = "none";
        } else {
            if (nextContainer) nextContainer.style.display = "flex";
            const total = this.activeDataLength;
            const end = Math.min(this.currentIndex + this.itemsPerPage, total);
            if (nextBtn) {
                nextBtn.innerText = `Nästa (${end} / ${total})`;
                nextBtn.disabled = (end >= total);
                nextBtn.style.opacity = (end >= total) ? "0.5" : "1";
            }
            if (prevBtn) {
                prevBtn.disabled = (this.currentIndex === 0);
                prevBtn.style.opacity = (this.currentIndex === 0) ? "0.5" : "1";
            }
        }
    },

    clearAll: function() {
        this.currentIndex = 0;
        this.data = this.shuffleData([...this.data]);
        this.renderExercises();
    }
};