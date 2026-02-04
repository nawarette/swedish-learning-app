// global/engine/table_engine.js

const engine = {
    currentIndex: 0,
    itemsPerPage: 10,
    data: [],
    selectionMode: false,
    activeDataLength: 0,
    showGroup: true,
    sortMode: 'alphabet', // 'alphabet' or 'group'
    config: {},

    init: function(fullDataArray, config) {
        this.config = config;
        this.storageKey = 'filter_' + window.location.pathname;
        
        const vocabularyOnly = fullDataArray.filter(item => 
            item.Type?.toLowerCase() === 'row' || item.Type?.toLowerCase() === 'data'
        );

        const savedSelections = JSON.parse(localStorage.getItem(this.storageKey)) || [];
        const pKey = this.config.primaryKey; 

        this.data = vocabularyOnly.map(item => {
            const isWordInSavedList = savedSelections.includes(item[pKey]);
            const shouldBeSelected = savedSelections.length === 0 ? true : isWordInSavedList;

            return { 
                ...item, 
                selected: shouldBeSelected 
            };
        });

        this.data = this.shuffleData([...this.data]);
        this.renderTable(); 
    },

    renderTable: function() {
        const tableBody = document.getElementById('practice-rows');
        const tableHead = document.querySelector('.practice-table thead');
        if (!tableBody) return;
        tableBody.innerHTML = '';

        if (tableHead) {
            tableHead.style.display = this.selectionMode ? 'none' : '';
        }

        const userLang = localStorage.getItem('userPreferredLang') || 'sv';
        let itemsToRender = [];
        let lastHeader = ""; 
        const totalCols = 8; 

        if (this.selectionMode) {
            itemsToRender = [...this.data];
            // --- STABLE SORTING ---
            itemsToRender.sort((a, b) => {
                if (this.sortMode === 'group') {
                    const valA = String(a['Data 7'] || '99');
                    const valB = String(b['Data 7'] || '99');
                    return valA.localeCompare(valB, 'sv', { numeric: true });
                } else {
                    const valA = String(a[this.config.primaryKey] || '');
                    const valB = String(b[this.config.primaryKey] || '');
                    return valA.localeCompare(valB, 'sv');
                }
            });
        } else {
            const filteredData = this.data.filter(item => item.selected);
            this.activeDataLength = filteredData.length;
            if (this.currentIndex >= this.activeDataLength) this.currentIndex = 0;
            itemsToRender = filteredData.slice(this.currentIndex, this.currentIndex + this.itemsPerPage);
        }
        
        itemsToRender.forEach((item) => {
            const pKey = this.config.primaryKey;
            
            if (this.selectionMode) {
                let currentHeader = "";
                if (this.sortMode === 'group') {
                    currentHeader = "Grupp " + (item['Data 7'] || "Odefinierad");
                } else {
                    currentHeader = (item[pKey] || " ").charAt(0).toUpperCase();
                }

                if (currentHeader !== lastHeader) {
                    const headerRow = document.createElement('tr');
                    headerRow.innerHTML = `<td colspan="${totalCols}" class="alphabet-header">${currentHeader}</td>`;
                    tableBody.appendChild(headerRow);
                    lastHeader = currentHeader;
                }
            }

            const tr = document.createElement('tr');
            let rowHtml = '';
            let transKey = (userLang === 'th') ? 'Data 9' : 'Data 8'; 

            if (this.selectionMode) {
                const checkbox = `<td style="text-align: center;"><input type="checkbox" ${item.selected ? 'checked' : ''} onchange="engine.toggleWordSelection('${item[pKey]}')"></td>`;
                const word = `<td class="target-word">${item[pKey]}</td>`;
                const group = `<td class="group-col">${item['Data 7'] || ''}</td>`;
                const spacer = `<td colspan="4" style="color: #999; font-style: italic; text-align: center;">--- Selection Mode ---</td>`;
                const trans = `<td style="text-align: left;">${item[transKey] || item['Data 8']}</td>`;
                rowHtml = checkbox + word + group + spacer + trans;
            } else {
                rowHtml += `<td><input type="text" placeholder="en/ett/-" data-answer="${item['Data 2']}" class="answer-input"></td>`;
                rowHtml += `<td class="target-word">${item['Data 3']}</td>`;
                rowHtml += `<td><input type="text" data-answer="${item['Data 4']}" class="answer-input"></td>`;
                rowHtml += `<td><input type="text" data-answer="${item['Data 5']}" class="answer-input"></td>`;
                rowHtml += `<td><input type="text" data-answer="${item['Data 6']}" class="answer-input"></td>`;
                rowHtml += `<td class="group-col">${item['Data 7'] || ''}</td>`;
                rowHtml += `<td class="kontroll-col"><div style="display: flex; gap: 5px;"><button class="row-check-btn" onclick="engine.checkRow(this)">OK</button><button class="row-show-btn" onclick="engine.showRow(this)">Visa</button></div></td>`;
                rowHtml += `<td style="text-align: left;"><span class="translation-text">${item[transKey] || item['Data 8']}</span></td>`;
            }
            
            tr.innerHTML = rowHtml;
            tableBody.appendChild(tr);
        });

        this.updateSelectionTools(); 
        this.updateUI();
    },

    toggleWordSelection: function(primaryValue) {
        const item = this.data.find(d => d[this.config.primaryKey] === primaryValue);
        if (item) item.selected = !item.selected;
        this.updateSelectionTools(); // Update button text immediately
    },

    toggleSelectAll: function() {
        const areAllSelected = this.data.every(item => item.selected);
        this.data.forEach(item => item.selected = !areAllSelected);
        this.renderTable();
    },

    toggleSortMode: function() {
        this.sortMode = (this.sortMode === 'alphabet') ? 'group' : 'alphabet';
        console.log("Sort Mode toggled to:", this.sortMode);
        this.renderTable();
    },

    enterSelectionMode: function() {
        this.selectionMode = true;
        this.sortMode = 'alphabet'; 
        
        document.getElementById('filter-btn').style.display = 'none';
        document.getElementById('restart-btn').style.display = 'none';

        // Fix: Always overwrite tools innerHTML to ensure buttons exist
        let tools = document.getElementById('selection-tools');
        if (tools) {
            tools.style.display = 'flex';
            tools.innerHTML = `
                <button id="select-all-btn" onclick="engine.toggleSelectAll()" style="margin-right: 5px;">Välj alla</button>
                <button id="toggle-sort-btn" onclick="engine.toggleSortMode()" style="background-color: var(--swedish-yellow); color: black;">Sortera efter Grupp (1-5)</button>
            `;
        }

        // Fix: Move Action buttons to the right
        const rightActions = document.querySelector('.right-actions');
        const filterControls = document.querySelector('.filter-controls');
        if (filterControls && rightActions) {
            rightActions.appendChild(filterControls); 
            document.getElementById('save-filter-btn').style.display = 'inline-block';
            document.getElementById('cancel-filter-btn').style.display = 'inline-block';
        }

        this.renderTable();
    },

    saveSelection: function() {
        const selectedNames = this.data.filter(item => item.selected).map(item => item[this.config.primaryKey]);
        localStorage.setItem(this.storageKey, JSON.stringify(selectedNames));
        this.selectionMode = false;
        location.reload(); 
    },

    updateSelectionTools: function() {
        const selectAllBtn = document.getElementById('select-all-btn');
        const sortBtn = document.getElementById('toggle-sort-btn');

        if (selectAllBtn) {
            const areAllSelected = this.data.every(item => item.selected);
            selectAllBtn.innerText = areAllSelected ? "Avmarkera alla" : "Välj alla";
        }

        if (sortBtn) {
            sortBtn.innerText = (this.sortMode === 'alphabet') 
                ? "Sortera efter Grupp (1-5)" 
                : "Sortera A-Ö";
        }
    },

    checkRow: function(element) {
        const row = element.closest('tr');
        const inputs = row.querySelectorAll('.answer-input');
        const translation = row.querySelector('.translation-text');
        
        inputs.forEach(input => {
            const val = input.value.trim().toLowerCase();
            const ans = (input.getAttribute('data-answer') || "").toLowerCase();
            if (val === "") return;
            input.style.backgroundColor = (val === ans ? "#d4edda" : "#f8d7da");
            input.style.color = (val === ans ? "#155724" : "#721c24");
        });
        if (translation) translation.classList.add('show-translation');
    },

    showRow: function(button) {
        const row = button.closest('tr');
        row.querySelectorAll('.answer-input').forEach(input => {
            input.value = input.getAttribute('data-answer');
            input.style.backgroundColor = "#fff3cd"; 
            input.style.color = "#856404";
        });
        const trans = row.querySelector('.translation-text');
        if (trans) trans.classList.add('show-translation');
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
            this.renderTable();
        }
    },

    loadPreviousSet: function() {
        if (this.currentIndex - this.itemsPerPage >= 0) {
            this.currentIndex -= this.itemsPerPage;
            this.renderTable();
        }
    },

    updateUI: function() {
        const nextBtn = document.getElementById('next-set-btn');
        const total = this.activeDataLength;
        const end = Math.min(this.currentIndex + this.itemsPerPage, total);
        if (nextBtn) {
            nextBtn.innerText = `Nästa (${end} / ${total})`;
            nextBtn.style.opacity = (end >= total) ? "0.5" : "1";
        }
    },

    clearAll: function() {
        this.currentIndex = 0;
        this.data = this.shuffleData([...this.data]);
        this.renderTable();
    }
};