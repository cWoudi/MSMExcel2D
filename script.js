document.addEventListener('DOMContentLoaded', () => {
    const hauteurMeubleInput = document.querySelector('#hauteurMeuble');
    const largeurMeubleInput = document.querySelector('#largeurMeuble');
    const nbTiroirsInput = document.querySelector('#nbTiroirs');
    const espaceFacadeSelect = document.querySelector('#espaceFacade');
    const rightTable = document.querySelector('.right-table tbody');
    const sumElement = document.querySelector('#sumHauteursFacade');
    const hauteurFacadeHeader = document.querySelector('.right-table th:nth-child(2)');

    function updateDrawerRows() {
        const numberOfDrawers = parseInt(nbTiroirsInput.value) || 0;
        const hauteurMeuble = parseFloat(hauteurMeubleInput.value) || 0;
        const defaultHauteurFacade = hauteurMeuble / numberOfDrawers;
        let isValid = true;
    
        while (rightTable.firstChild) {
            rightTable.removeChild(rightTable.firstChild);
        }
    
        const encastréSelect = document.createElement('select');
        encastréSelect.className = 'encastré';
        const option1C = new Option('1C', '1c');
        const option2C = new Option('2C', '2c');
        encastréSelect.add(option1C, undefined);
        encastréSelect.add(option2C, undefined);
    
        // Prepare a cell to insert the select only once and set it to span all rows
        const encastréCell = document.createElement('td');
        encastréCell.appendChild(encastréSelect);
        encastréCell.rowSpan = numberOfDrawers;
    
        for (let i = 0; i < numberOfDrawers; i++) {
            const row = rightTable.insertRow();
            row.insertCell(0).textContent = `Tiroir ${i + 1}`;
    
            const hauteursFacadeInput = document.createElement('input');
            hauteursFacadeInput.type = 'number';
            hauteursFacadeInput.className = 'hauteursFacade';
            hauteursFacadeInput.value = defaultHauteurFacade.toFixed(2);
            hauteursFacadeInput.addEventListener('input', () => {
                calculateHauteurFacadeReelle(hauteursFacadeInput, i);
                calculateEmplacementCoulisses(i);
                checkFacadeHeight(hauteursFacadeInput);
                drawMeuble(); 
            });
            row.insertCell(1).appendChild(hauteursFacadeInput);
    
            const hauteurFacadeReelleCell = row.insertCell(2);
            hauteurFacadeReelleCell.textContent = hauteursFacadeInput.value;
    
            const emplacementCoulissesCell = row.insertCell(3);
            emplacementCoulissesCell.textContent = '0.00';
    
            calculateHauteurFacadeReelle(hauteursFacadeInput, i);
            calculateEmplacementCoulisses(i);
    
            if (parseFloat(hauteursFacadeInput.value) < 80) {
                isValid = false;
            }
    
            const tiroirAnglaiseCell = row.insertCell(4);
            const tiroirAnglaiseCheckbox = document.createElement('input');
            tiroirAnglaiseCheckbox.type = 'checkbox';
            tiroirAnglaiseCheckbox.className = 'tiroir-anglaise';
            tiroirAnglaiseCheckbox.disabled = (i === 0);
            tiroirAnglaiseCheckbox.addEventListener('change', (e) => {
                handleAnglaiseChange(e.target, i);
            });
            tiroirAnglaiseCell.appendChild(tiroirAnglaiseCheckbox);
    
            // Add the encastré selector to the first row only
            if (i === 0) {
                row.appendChild(encastréCell);
            }
        }
    
        const heightError = document.getElementById('heightError');
        heightError.style.display = isValid ? 'none' : 'block';
        drawMeuble(); 
    }
    
    
    
    function handleAnglaiseChange(checkbox, rowIndex) {
        const currentRow = rightTable.rows[rowIndex];
        const currentHauteurFacadeReelleCell = currentRow.cells[2];
        const currentInputHauteursFacade = currentRow.cells[1].querySelector('input');
    
        const previousRowIndex = rowIndex - 1;
        const previousRow = rightTable.rows[previousRowIndex];
        const previousHauteurFacadeReelleCell = previousRow?.cells[2];
        const previousInputHauteursFacade = previousRow?.cells[1].querySelector('input');
    
        if (checkbox.checked) {
            if (previousHauteurFacadeReelleCell) {
                const currentValue = parseFloat(currentHauteurFacadeReelleCell.textContent) || 0;
                const previousValue = parseFloat(previousHauteurFacadeReelleCell.textContent) || 0;
                previousHauteurFacadeReelleCell.textContent = (currentValue + previousValue).toFixed(2);
                currentHauteurFacadeReelleCell.textContent = '0.00';
                currentHauteurFacadeReelleCell.style.backgroundColor = '#e0e0e0';
            }
        } else {
            if (previousHauteurFacadeReelleCell) {
                // Conserver la valeur originale du tiroir actuel avant de recalculer la valeur du tiroir précédent
                const originalCurrentHauteur = parseFloat(currentInputHauteursFacade.value) || 0;
    
                // Recalculer la hauteur façade réelle pour le tiroir précédent
                calculateHauteurFacadeReelle(previousInputHauteursFacade, previousRowIndex);
                const recalculatedPreviousValue = parseFloat(previousHauteurFacadeReelleCell.textContent) || 0;
    
                // Ajuster la hauteur du tiroir actuel
                currentHauteurFacadeReelleCell.textContent = (originalCurrentHauteur - recalculatedPreviousValue).toFixed(2);
                currentHauteurFacadeReelleCell.style.backgroundColor = '';
            }
    
            // Recalculer également la hauteur du tiroir actuel
            calculateHauteurFacadeReelle(currentInputHauteursFacade, rowIndex);
        }
    
        drawMeuble(); // Redessiner après les changements
    }
    
    
    

    function checkFacadeHeight(inputElement) {
        const heightError = document.getElementById('heightError');
        const height = parseFloat(inputElement.value);
        if (height < 80) {
            heightError.style.display = 'block';
        } else {
            const allValid = Array.from(document.querySelectorAll('.hauteursFacade'))
                                  .every(input => parseFloat(input.value) >= 80);
            if (allValid) {
                heightError.style.display = 'none';
            }
        }
    }

    function calculateHauteurFacadeReelle(inputHauteursFacade, rowIndex) {
        const hauteurMeuble = parseFloat(hauteurMeubleInput.value) || 0;
        const nombreDeTiroirs = parseInt(nbTiroirsInput.value) || 0;
        const espaceFacade = espaceFacadeSelect.value.toLowerCase();
        const hauteurFacade = parseFloat(inputHauteursFacade.value) || 0;

        let hauteurFacadeReelle = 0;
        if (espaceFacade === "pdm") {
            hauteurFacadeReelle = (hauteurMeuble - (22 * (nombreDeTiroirs - 1))) * (hauteurFacade / hauteurMeuble);
        } else {
            hauteurFacadeReelle = (hauteurMeuble - (2 * (nombreDeTiroirs - 1))) * (hauteurFacade / hauteurMeuble);
        }

        const hauteurFacadeReelleCell = rightTable.rows[rowIndex].cells[2];
        hauteurFacadeReelleCell.textContent = hauteurFacadeReelle.toFixed(2);

        updateSumHauteursFacade();
        drawMeuble(); 
    }

    function calculateEmplacementCoulisses(rowIndex) {
        const plancheBasHaut = document.querySelector('#plancheBasHaut').value;
        const espaceFacade = espaceFacadeSelect.value;
        let hauteurFacadeReelle;

        if (rowIndex === 0) {
            hauteurFacadeReelle = parseFloat(rightTable.rows[rowIndex].cells[2].textContent) || 0;
            if (!hauteurFacadeReelle || !espaceFacade || !plancheBasHaut) {
                valeurEmplacementCoulisses = '';
            } else if (espaceFacade.toLowerCase() === 'pdm' && (plancheBasHaut === 'ph' || plancheBasHaut === 'aucun')) {
                valeurEmplacementCoulisses = 59;
            } else {
                valeurEmplacementCoulisses = 37;
            }
        } else if (rowIndex === 1) {
            hauteurFacadeReelle = parseFloat(rightTable.rows[rowIndex - 1].cells[2].textContent) || 0;
            if (!plancheBasHaut || hauteurFacadeReelle === 0) {
                valeurEmplacementCoulisses = '';
            } else if (["pb & ph", "pb"].includes(plancheBasHaut)) {
                valeurEmplacementCoulisses = espaceFacade === "pdm" ? hauteurFacadeReelle + 59 : hauteurFacadeReelle + 23;
            } else {
                valeurEmplacementCoulisses = espaceFacade === "pdm" ? hauteurFacadeReelle + 78 : hauteurFacadeReelle + 42;
            }
        } else {
            hauteurFacadeReelle = parseFloat(rightTable.rows[rowIndex - 1].cells[2].textContent) || 0;
            let emplacementCoulissesPrecedent = parseFloat(rightTable.rows[rowIndex - 1].cells[3].textContent) || 0;
            if (!emplacementCoulissesPrecedent || hauteurFacadeReelle === 0) {
                valeurEmplacementCoulisses = '';
            } else {
                valeurEmplacementCoulisses = espaceFacade === "pdm" ? emplacementCoulissesPrecedent + hauteurFacadeReelle + 22 : emplacementCoulissesPrecedent + hauteurFacadeReelle + 2;
            }
        }

        const emplacementCoulissesCell = rightTable.rows[rowIndex].cells[3];
        emplacementCoulissesCell.textContent = valeurEmplacementCoulisses.toFixed(2);
        drawMeuble(); 
    }

    function drawMeuble() {
        const canvas = document.getElementById('meubleCanvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    
        const hauteurMeuble = parseFloat(hauteurMeubleInput.value) || 0;
        const largeurMeuble = parseFloat(largeurMeubleInput.value) || 0;
        const scaleFactor = Math.min((canvas.width - 40) / largeurMeuble, (canvas.height - 40) / hauteurMeuble);
        const scaledHeight = hauteurMeuble * scaleFactor;
        const scaledWidth = largeurMeuble * scaleFactor;
        const startX = (canvas.width - scaledWidth) / 2;
        const startY = (canvas.height - scaledHeight) / 2;
    
        // Dessiner le rectangle du meuble
        ctx.strokeRect(startX, startY, scaledWidth, scaledHeight);
    
        // Obtenir les éléments pour Encastré et Tiroir à l'anglaise en dehors de la boucle
        const encastréElement = document.querySelector('.encastré');
        const encastré = encastréElement ? encastréElement.value : '';
        const tiroirAnglaiseCheckbox = document.querySelector('.tiroir-anglaise');
        const tiroirAnglaise = tiroirAnglaiseCheckbox ? tiroirAnglaiseCheckbox.checked : false;
    
        const rows = rightTable.querySelectorAll('tr');
        rows.forEach(row => {
            const emplacement = parseFloat(row.cells[3].textContent) || 0;
            const emplacementHeight = startY + scaledHeight - (emplacement * scaleFactor);
    
            let offset = 37; // Début des pointillés à 37mm par défaut
            if (tiroirAnglaise) offset += 25;
            if (encastré === '1c' || encastré === '2c') offset += 63;
    
            // Dessiner les lignes en pointillé pour l'emplacement des coulisses
            ctx.beginPath();
            ctx.setLineDash([5, 5]);
            ctx.moveTo(startX + offset, emplacementHeight);
            ctx.lineTo(startX + scaledWidth, emplacementHeight);
            ctx.stroke();
        });
    
        ctx.setLineDash([]);
        ctx.textAlign = 'center';
        ctx.fillText(`Largeur: ${largeurMeuble} mm`, canvas.width / 2, startY + scaledHeight + 20);
        ctx.textAlign = 'start';
        ctx.fillText(`Hauteur: ${hauteurMeuble} mm`, startX - 50, startY + scaledHeight / 2);
    }
    
    hauteurMeubleInput.addEventListener('input', drawMeuble);
    document.querySelector('#largeurMeuble').addEventListener('input', drawMeuble); 
    nbTiroirsInput.addEventListener('change', drawMeuble); 
    
    
    function updateSumHauteursFacade() {    
        let sum = 0;
        rightTable.querySelectorAll('.hauteursFacade').forEach(input => {
            sum += parseFloat(input.value) || 0;
        });
        sumElement.textContent = sum.toFixed(2);
        
        const hauteurMeuble = parseFloat(hauteurMeubleInput.value) || 0;
        if (Math.abs(sum - hauteurMeuble) > 0.03) {
            sumElement.style.color = 'red';
            hauteurFacadeHeader.style.color = 'red';
        } else {
            sumElement.style.color = 'black';
            hauteurFacadeHeader.style.color = 'black';
        }
    }
    

    function updateAll() {
        updateDrawerRows(nbTiroirsInput.value);
        updateSumHauteursFacade();
    }

    document.querySelectorAll('.left-table input, .left-table select').forEach(element => {
        element.addEventListener('change', updateAll);
    });

    updateAll();
});
