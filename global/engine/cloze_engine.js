// global/engine/cloze_engine.js

const clozeEngine = {
    currentIndex: 0,
    itemsPerPage: 10,
    data: [],
    selectionMode: false,
    activeDataLength: 0,
    storageKey: '',

    // 1. Initialize with Modular Data
    init: function(fullDataArray) {
        this.storageKey = 'cloze_filter_' + window.location.pathname;
        
        // ARCHITECTURE FIX: Only use rows where Type is 'row' or 'data'
        const clozeOnly = fullDataArray.filter(item => 
            item.Type === 'row' || item.Type === 'data'
        );

        const savedSelections = JSON.parse(localStorage.getItem(this.storageKey)) || [];
        
        this.data = clozeOnly.map((item, index) => {
            const uniqueId = item['Content/Key'] || `q-${index}`;
            const isWordInSavedList = savedSelections.includes(uniqueId);
            const shouldBeSelected = savedSelections.length === 0 ? true : isWordInSavedList;

            return { 
                ...item, 
                id: uniqueId,
                selected: shouldBeSelected 
            };
        });

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

    // 2a. Practice Mode UI (Multi-language and Dynamic Width)
    renderPracticeUI: function(container) {
        const filteredData = this.data.filter(item => item.selected);
        this.activeDataLength = filteredData.length;
        const itemsToRender = filteredData.slice(this.currentIndex, this.currentIndex + this.itemsPerPage);
        
        if (itemsToRender.length === 0) {
            container.innerHTML = "<p style='text-align:center; padding: 20px;'>Inga meningar valda. Gå till 'Setting' för att välja nummer.</p>";
            return;
        }

        // Principle: Determine base language for translation/hint
        // Data 1 = SV, Data 2 = EN, Data 3 = TH
        const userLang = localStorage.getItem('userPreferredLang') || 'sv';
        let hintColumn = 'Data 1';
        if (userLang === 'en') hintColumn = 'Data 2';
        if (userLang === 'th') hintColumn = 'Data 3';

        itemsToRender.forEach((item) => {
            const card = document.createElement('div');
            card.className = 'exercise-card';

            const sentence = item['Content/Key'] || "";
            const answer = item['Data 1'] || ""; // Data 1 is always the Swedish answer
            const hint = item[hintColumn] || item['Data 1']; // Fallback to SV if empty

            // DYNAMIC WIDTH LOGIC: Calculate width based on answer length
            const inputWidth = Math.max(answer.length, 4) * 1.2; 

            const sentenceWithInput = sentence.replace("___", 
                `<input type="text" 
                    class="cloze-input" 
                    style="width: ${inputWidth}ch" 
                    autocomplete="off" 
                    data-answer="${answer}" 
                    placeholder="..."
                    onkeypress="if(event.key === 'Enter') clozeEngine.checkAnswer(this)">`
            );

            card.innerHTML = `
                <div class="exercise-content">
                    <div class="hint-row">
                        <span class="hint-badge">Ledtråd: ${hint}</span>
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

        this.data.forEach((item) => {
            const row = document.createElement('div');
            row.className = 'selection-item-row';
            const sentenceDisplay = (item['Content/Key'] || "").replace("___", "______");
            const answerDisplay = item['Data 1'] || "";

            row.innerHTML = `
                <div style="display: flex; align-items: flex-start; gap: 15px; width: 100%;">
                    <input type="checkbox" class="selection-checkbox" style="margin-top: 5px; transform: scale(1.2);" 
                        ${item.selected ? 'checked' : ''} 
                        onchange="clozeEngine.toggleItemSelection('${item.id}')">
                    <div style="flex: 1;">
                        <div class="sentence-row" style="padding:0;">
                            <span style="color: #333; font-weight: bold;">${answerDisplay}</span>
                            <span style="color: #666; font-size: 0.95rem; display: block;">${sentenceDisplay}</span>
                        </div>
                    </div>
                </div>
            `;
            listContainer.appendChild(row);
        });
        container.appendChild(listContainer);
    },

    // ... (rest of helper functions: toggleItemSelection, toggleSelectAll, enterSelectionMode, etc.)
    toggleItemSelection: function(id) {
        const item = this.data.find(d => d.id === id);
        if (item) item.selected = !item.selected;
        this.updateSelectionButtons();
    },

    toggleSelectAll: function() {
        const allSelected = this.data.every(item => item.selected);
        const newState = !allSelected;
        this.data.forEach(item => item.selected = newState);
        this.renderExercises();
        this.updateSelectionButtons();
    },

    enterSelectionMode: function() {
        this.selectionMode = true;
        const saveBtn = document.getElementById('save-filter-btn');
        const cancelBtn = document.getElementById('cancel-filter-btn');
        const rightActions = document.querySelector('.right-actions');
        const filterControls = document.querySelector('.filter-controls');

        if(saveBtn) saveBtn.style.display = 'inline-block';
        if(cancelBtn) cancelBtn.style.display = 'inline-block';
        if(filterControls && rightActions) rightActions.appendChild(filterControls);

        let tools = document.getElementById('selection-tools');
        if (!tools) {
            tools = document.createElement('div');
            tools.id = 'selection-tools';
            tools.style.display = 'inline-block';
            tools.style.marginLeft = '10px';
            tools.innerHTML = `<button id="select-all-btn" onclick="clozeEngine.toggleSelectAll()" style="background-color: #6c757d; color: white;">Välj alla</button>`;
            document.querySelector('.left-actions').appendChild(tools);
        } else {
            tools.style.display = 'inline-block';
        }
        this.renderExercises();
    },

    saveSelection: function() {
        const selectedIds = this.data.filter(item => item.selected).map(item => item.id);
        localStorage.setItem(this.storageKey, JSON.stringify(selectedIds));
        this.selectionMode = false;
        location.reload(); 
    },

    updateSelectionButtons: function() {
        const btn = document.getElementById('select-all-btn');
        if (btn) {
            const allSelected = this.data.every(item => item.selected);
            btn.innerText = allSelected ? "Avmarkera alla" : "Välj alla";
        }
    },

    checkAnswer: function(element) {
        const card = element.closest('.exercise-card');
        const input = card.querySelector('.cloze-input');
        if (!input) return;
        const userValue = input.value.trim().toLowerCase();
        const correctAnswer = input.getAttribute('data-answer').toLowerCase();
        
        input.style.backgroundColor = (userValue === "") ? "" : (userValue === correctAnswer ? "#d4edda" : "#f8d7da");
        input.style.color = (userValue === correctAnswer ? "#155724" : "#721c24");
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
        const total = this.activeDataLength;
        const end = Math.min(this.currentIndex + this.itemsPerPage, total);

        if (nextBtn) {
            nextBtn.innerText = `Nästa (${end} / ${total})`;
            nextBtn.style.opacity = (end >= total) ? "0.5" : "1";
            nextBtn.disabled = (end >= total);
        }
    },

    clearAll: function() {
        this.currentIndex = 0;
        this.data = this.shuffleData([...this.data]);
        this.renderExercises();
    }
};