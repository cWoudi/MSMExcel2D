document.addEventListener('DOMContentLoaded', () => {
    const hauteurMeubleInput = document.querySelector('#hauteurMeuble');
    const nbTiroirsInput = document.querySelector('#nbTiroirs');
    const espaceFacadeSelect = document.querySelector('#espaceFacade');
    const rightTable = document.querySelector('.right-table tbody');
    const sumElement = document.querySelector('#sumHauteursFacade');
    const hauteurFacadeHeader = document.querySelector('.right-table th:nth-child(2)');

    function updateDrawerRows() {
        const numberOfDrawers = parseInt(nbTiroirsInput.value) || 0;
        while (rightTable.firstChild) {
            rightTable.removeChild(rightTable.firstChild);
        }

        const hauteurMeuble = parseFloat(hauteurMeubleInput.value) || 0;
        const defaultHauteurFacade = hauteurMeuble / numberOfDrawers;

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
            });
            row.insertCell(1).appendChild(hauteursFacadeInput);

            const cellHauteurFacadeReelle = row.insertCell(2);
            cellHauteurFacadeReelle.textContent = '';  

            row.insertCell(3);  

            calculateHauteurFacadeReelle(hauteursFacadeInput, i);
            calculateEmplacementCoulisses(i);
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
    }
    
    function updateSumHauteursFacade() {    
        let sum = 0;
        rightTable.querySelectorAll('.hauteursFacade').forEach(input => {
            sum += parseFloat(input.value) || 0;
        });
        sumElement.textContent = sum.toFixed(2);
        
        const hauteurMeuble = parseFloat(hauteurMeubleInput.value) || 0;
        if (sum > hauteurMeuble) {
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

