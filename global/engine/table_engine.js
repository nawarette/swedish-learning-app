// file:///Users/bentoblitzz/Documents/Playground/svenska_ovning/global/engine/table_engine.js

const engine = {
    currentIndex: 0,
    itemsPerPage: 10,
    data: [],
    selectionMode: false,
    activeDataLength: 0,
    showGroup: true,
    config: {}, // Stores the map defined in the HTML

    // 1. Initialize with Config
    init: function(dataArray, config) {
        this.config = config;
        this.storageKey = 'filter_' + window.location.pathname;
        
        const savedSelections = JSON.parse(localStorage.getItem(this.storageKey)) || [];
        const pKey = this.config.primaryKey;

        this.data = dataArray.map(item => {
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

    // 2. Dynamic Render Loop
    renderTable: function() {
        const tableBody = document.getElementById('practice-rows');
        const tableHead = document.querySelector('.practice-table thead');
        if (!tableBody) return;
        tableBody.innerHTML = '';

        if (tableHead) {
            tableHead.style.display = this.selectionMode ? 'none' : '';
        }

        let itemsToRender = [];
        let lastLetter = ""; 
        const totalCols = this.config.columns.length;

        if (this.selectionMode) {
            itemsToRender = this.data;
        } else {
            const filteredData = this.data.filter(item => item.selected);
            this.activeDataLength = filteredData.length;

            if (this.currentIndex >= this.activeDataLength) {
                this.currentIndex = 0;
            }

            itemsToRender = filteredData.slice(this.currentIndex, this.currentIndex + this.itemsPerPage);
        }
        
        itemsToRender.forEach((item, index) => {
            const pKey = this.config.primaryKey;
            
            if (this.selectionMode) {
                const wordToCompare = item[pKey] || "";
                const currentLetter = wordToCompare.charAt(0).toUpperCase();
                if (currentLetter !== lastLetter) {
                    const headerRow = document.createElement('tr');
                    headerRow.innerHTML = `<td colspan="${totalCols}" class="alphabet-header">${currentLetter}</td>`;
                    tableBody.appendChild(headerRow);
                    lastLetter = currentLetter;
                }
            }

            const tr = document.createElement('tr');
            let rowHtml = '';

            if (this.selectionMode) {
                // FIXED: Selection Mode row logic - Now dynamically checks for Group column
                const checkboxCell = `<td style="text-align: center;"><input type="checkbox" ${item.selected ? 'checked' : ''} onchange="engine.toggleWordSelection(${index})"></td>`;
                const hintCell = `<td class="target-word">${item[pKey]}</td>`;
                
                // NERDY ADVISOR NOTE: Check if a 'group' column exists in the config
                const groupColConfig = this.config.columns.find(col => col.type === 'group');
                let groupCell = "";
                let baseColUsed = 3; // checkbox + primary word + translation

                if (groupColConfig) {
                    groupCell = `<td class="group-col" style="text-align: center; font-style: italic; color: #888;">${item[groupColConfig.key] || ''}</td>`;
                    baseColUsed += 1;
                }

                const spacerColspan = totalCols - baseColUsed; 
                const spacerCell = `<td colspan="${spacerColspan}" style="color: #999; font-style: italic; text-align: center;">--- Selection Mode ---</td>`;
                const translationCell = `<td style="text-align: left;">${item.translation || ''}</td>`;
                
                rowHtml = checkboxCell + hintCell + groupCell + spacerCell + translationCell;
            } else {
                // Practice Mode Row
                this.config.columns.forEach(col => {
                    switch(col.type) {
                        case 'input_hint':
                            rowHtml += `<td><input type="text" placeholder="${col.placeholder}" data-answer="${item[col.key]}" class="answer-input"></td>`;
                            break;
                        case 'hint':
                            rowHtml += `<td class="target-word">${item[col.key]}</td>`;
                            break;
                        case 'input':
                            rowHtml += `<td><input type="text" data-answer="${item[col.key]}" class="answer-input"></td>`;
                            break;
                        case 'group':
                            rowHtml += `<td class="group-col" style="text-align: center; font-style: italic; color: #888;">${item[col.key]}</td>`;
                            break;
                        case 'control':
                            rowHtml += `<td class="kontroll-col"><div style="display: flex; gap: 5px; justify-content: center;"><button class="row-check-btn" onclick="engine.checkRow(this)">OK</button><button class="row-show-btn" onclick="engine.showRow(this)">Visa</button></div></td>`;
                            break;
                        case 'translation':
                            rowHtml += `<td style="text-align: left;"><span class="translation-text">${item[col.key]}</span></td>`;
                            break;
                    }
                });
            }
            
            tr.innerHTML = rowHtml;
            tableBody.appendChild(tr);

            const inputs = tr.querySelectorAll('.answer-input');
            inputs.forEach(input => {
                input.addEventListener('keypress', (e) => { if (e.key === 'Enter') engine.checkRow(input); });
            });
        });

        // Ensure visibility logic applies to selection mode too
        const groupCells = document.querySelectorAll('.group-col');
        groupCells.forEach(cell => cell.style.display = this.showGroup ? '' : 'none');

        if (this.selectionMode) this.updateSelectionTools();
        this.updateUI();
    },

    // Logic & Helpers
    shuffleData: function(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    },

    toggleWordSelection: function(index) {
        this.data[index].selected = !this.data[index].selected;
        this.renderTable();
    },

    toggleSelectAll: function() {
        const areAllSelected = this.data.every(item => item.selected);
        const newState = !areAllSelected;
        this.data.forEach(item => item.selected = newState);
        this.renderTable();
    },

    updateSelectionTools: function() {
        const selectAllBtn = document.getElementById('select-all-btn');
        if (selectAllBtn) {
            const areAllSelected = this.data.every(item => item.selected);
            selectAllBtn.innerText = areAllSelected ? "Avmarkera alla" : "Välj alla";
        }
    },

    toggleGroupVisibility: function() {
        this.showGroup = !this.showGroup;
        this.renderTable();
    },

    enterSelectionMode: function() {
        this.selectionMode = true;
        const pKey = this.config.primaryKey;
        this.data.sort((a, b) => {
            let itemA = a[pKey] || "";
            let itemB = b[pKey] || "";
            return itemA.localeCompare(itemB, 'sv');
        });
        
        if(document.getElementById('filter-btn')) document.getElementById('filter-btn').style.display = 'none';
        if(document.getElementById('restart-btn')) document.getElementById('restart-btn').style.display = 'none';
        
        const saveBtn = document.getElementById('save-filter-btn');
        const cancelBtn = document.getElementById('cancel-filter-btn');
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

            const canShowGroup = this.config.showGroup !== false;

            tools.innerHTML = `
                <button id="select-all-btn" onclick="engine.toggleSelectAll()" style="background-color: #6c757d; color: white; margin-right: 5px;">Välj alla</button>
                ${canShowGroup ? '<button onclick="engine.toggleGroupVisibility()" style="background-color: #6c757d; color: white;">Visa/Dölj grupp</button>' : ''}
            `;
            const leftContainer = document.querySelector('.left-actions');
            if(leftContainer) leftContainer.appendChild(tools);
        } else { 
            tools.style.display = 'inline-block'; 
            const groupBtn = tools.querySelector('button[onclick="engine.toggleGroupVisibility()"]');
            if (groupBtn) {
                groupBtn.style.display = this.config.showGroup === false ? 'none' : 'inline-block';
            }
        }
        this.renderTable();
    },

    saveSelection: function() {
        const pKey = this.config.primaryKey;
        const selectedNames = this.data.filter(item => item.selected).map(item => item[pKey]);
        localStorage.setItem(this.storageKey, JSON.stringify(selectedNames));

        this.currentIndex = 0;
        this.selectionMode = false;

        if(document.getElementById('filter-btn')) document.getElementById('filter-btn').style.display = 'inline-block';
        if(document.getElementById('restart-btn')) document.getElementById('restart-btn').style.display = 'inline-block';
        if(document.getElementById('save-filter-btn')) document.getElementById('save-filter-btn').style.display = 'none';
        if(document.getElementById('cancel-filter-btn')) document.getElementById('cancel-filter-btn').style.display = 'none';
        
        const tools = document.getElementById('selection-tools');
        if (tools) tools.style.display = 'none';

        const filterControls = document.querySelector('.filter-controls');
        const leftActions = document.querySelector('.left-actions');
        if(filterControls && leftActions) {
            leftActions.appendChild(filterControls);
        }

        this.renderTable();
    },

    loadNextSet: function() {
        const totalActive = this.selectionMode ? this.data.length : this.activeDataLength;
        if (this.currentIndex + this.itemsPerPage < totalActive) {
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
        const prevBtn = document.getElementById('prev-set-btn');
        const totalActive = this.selectionMode ? this.data.length : this.activeDataLength;
        const end = Math.min(this.currentIndex + this.itemsPerPage, totalActive);

        if (nextBtn) {
            nextBtn.parentElement.style.display = this.selectionMode ? "none" : "flex";
            nextBtn.innerText = `Nästa (${end} / ${totalActive})`;
            nextBtn.style.opacity = (end >= totalActive) ? "0.5" : "1";
            nextBtn.style.pointerEvents = (end >= totalActive) ? "none" : "auto";
        }
        if (prevBtn) {
            prevBtn.style.opacity = (this.currentIndex === 0) ? "0.5" : "1";
            prevBtn.style.pointerEvents = (this.currentIndex === 0) ? "none" : "auto";
        }
    },

    checkRow: function(element) {
        const row = element.closest('tr');
        const inputs = row.querySelectorAll('.answer-input');
        const translation = row.querySelector('.translation-text');
        
        inputs.forEach(input => {
            const val = input.value.trim().toLowerCase();
            const ans = input.getAttribute('data-answer').toLowerCase();
            input.style.backgroundColor = (val === "") ? "" : (val === ans ? "#d4edda" : "#f8d7da");
            input.style.color = (val === ans ? "#155724" : "#721c24");
        });
        if (translation) translation.classList.add('show-translation');
    },

    showRow: function(button) {
        const row = button.closest('tr');
        const inputs = row.querySelectorAll('.answer-input');
        const translation = row.querySelector('.translation-text');
        inputs.forEach(input => {
            input.value = input.getAttribute('data-answer');
            input.style.backgroundColor = "#fff3cd"; 
            input.style.color = "#856404";
        });
        if (translation) translation.classList.add('show-translation');
    },

    clearAll: function() {
        this.currentIndex = 0;
        this.data = this.shuffleData([...this.data]);
        this.renderTable();
    }
};