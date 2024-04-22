document.addEventListener('DOMContentLoaded', () => {
    const hauteurMeubleInput = document.querySelector('#hauteurMeuble');
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
            tiroirAnglaiseCheckbox.disabled = (i === numberOfDrawers - 1); 
            tiroirAnglaiseCheckbox.addEventListener('change', (e) => {
                handleAnglaiseChange(e.target, i);
            });
            tiroirAnglaiseCell.appendChild(tiroirAnglaiseCheckbox);
        }
    
        const heightError = document.getElementById('heightError');
        heightError.style.display = isValid ? 'none' : 'block';
        drawMeuble(); 
    }
    
    function handleAnglaiseChange(checkbox, rowIndex) {
        const currentHauteurFacadeReelleCell = rightTable.rows[rowIndex].cells[2];
        const nextRowIndex = rowIndex + 1;
        const nextHauteurFacadeReelleCell = rightTable.rows[nextRowIndex]?.cells[2];
        const previousRowIndex = rowIndex - 1;
    
        if (checkbox.checked) {
            if (nextHauteurFacadeReelleCell) {
                const nextValue = parseFloat(nextHauteurFacadeReelleCell.textContent) || 0;
                const currentValue = parseFloat(currentHauteurFacadeReelleCell.textContent) || 0;
                currentHauteurFacadeReelleCell.textContent = (currentValue + nextValue).toFixed(2);
                
                nextHauteurFacadeReelleCell.textContent = '0.00';
                nextHauteurFacadeReelleCell.style.backgroundColor = '#e0e0e0';
            }
        } else {
            const inputHauteursFacade = rightTable.rows[rowIndex].cells[1].querySelector('input');
            calculateHauteurFacadeReelle(inputHauteursFacade, rowIndex);
    
            if (nextRowIndex < nbTiroirsInput.value) {
                const nextInputHauteursFacade = rightTable.rows[nextRowIndex].cells[1].querySelector('input');
                calculateHauteurFacadeReelle(nextInputHauteursFacade, nextRowIndex);
                
                nextHauteurFacadeReelleCell.style.backgroundColor = '';
            }
        }
    
        if (previousRowIndex >= 0 && checkbox.checked) {
            const previousCheckbox = rightTable.rows[previousRowIndex].cells[4].querySelector('.tiroir-anglaise');
            if (previousCheckbox && previousCheckbox.checked) {
                const previousHauteurFacadeReelleCell = rightTable.rows[previousRowIndex].cells[2];
                const previousValue = parseFloat(previousHauteurFacadeReelleCell.textContent) || 0;
                const addedValue = parseFloat(currentHauteurFacadeReelleCell.textContent) || 0;
                previousHauteurFacadeReelleCell.textContent = (previousValue + addedValue).toFixed(2);
            }
        }
    
        drawMeuble(); 
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
        const largeurMeuble = parseFloat(document.querySelector('#largeurMeuble').value) || 0;
    
        const scaleFactor = Math.min((canvas.width - 40) / largeurMeuble, (canvas.height - 40) / hauteurMeuble);
        const scaledHeight = hauteurMeuble * scaleFactor;
        const scaledWidth = largeurMeuble * scaleFactor;
    
        const startX = (canvas.width - scaledWidth) / 2;
        const startY = (canvas.height - scaledHeight) / 2;
    
        ctx.strokeRect(startX, startY, scaledWidth, scaledHeight);
    
        for (let i = rightTable.rows.length - 1; i >= 0; i--) {
            const emplacement = parseFloat(rightTable.rows[i].cells[3].textContent) || 0;
            let emplacementHeight = startY + scaledHeight - (emplacement * scaleFactor);
    
            ctx.beginPath();
            ctx.setLineDash([5, 5]);
            ctx.moveTo(startX, emplacementHeight);
            ctx.lineTo(startX + scaledWidth, emplacementHeight);
            ctx.stroke();
            ctx.fillText(`${emplacement} mm`, startX + scaledWidth + 5, emplacementHeight);
        }
    
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
