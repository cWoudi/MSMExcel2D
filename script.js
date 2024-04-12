document.addEventListener('DOMContentLoaded', () => {
    const hauteurMeubleInput = document.querySelector('#hauteurMeuble');
    const nbTiroirsInput = document.querySelector('#nbTiroirs');
    const espaceFacadeSelect = document.querySelector('#espaceFacade');
    const plancheBasHautSelect = document.querySelector('#plancheBasHaut'); // Correction ici pour sélectionner le bon élément
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
                calculateEmplacementCoulisses(i); // Assurez-vous que cette fonction est appelée après chaque mise à jour
            });
            row.insertCell(1).appendChild(hauteursFacadeInput);

            const cellHauteurFacadeReelle = row.insertCell(2);
            cellHauteurFacadeReelle.textContent = '';  // Cell for "Hauteur Facade Reelle"

            row.insertCell(3);  // Cell for "Emplacement Coulisses" will be updated in calculateEmplacementCoulisses

            calculateHauteurFacadeReelle(hauteursFacadeInput, i);
            calculateEmplacementCoulisses(i); // Appel initial pour définir la valeur par défaut
        }
    }

    function calculateHauteurFacadeReelle(inputHauteursFacade, rowIndex) {
        const hauteurMeuble = parseFloat(hauteurMeubleInput.value) || 0;
        const nombreDeTiroirs = parseInt(nbTiroirsInput.value) || 0;
        // Convertir la valeur récupérée en minuscules pour la comparaison
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
        const plancheBasHaut = document.querySelector('#plancheBasHaut').value; // "Planche Basse/Haute" du premier tableau (B6)
        const espaceFacade = espaceFacadeSelect.value; // "Emplacement Façade" (B5)
        let hauteurFacadeReelle; // Définir la variable ici pour un accès global dans cette fonction
    
        if (rowIndex === 0) {
            hauteurFacadeReelle = parseFloat(rightTable.rows[rowIndex].cells[2].textContent) || 0; // "Hauteur Façade Réelle" du premier tiroir
            // Appliquer la logique existante pour le premier tiroir si elle est différente
            if (!hauteurFacadeReelle || !espaceFacade || !plancheBasHaut) {
                valeurEmplacementCoulisses = '';
            } else if (espaceFacade.toLowerCase() === 'pdm' && (plancheBasHaut === 'ph' || plancheBasHaut === 'aucun')) {
                valeurEmplacementCoulisses = 59;
            } else {
                valeurEmplacementCoulisses = 37;
            } 
        } else {
            hauteurFacadeReelle = parseFloat(rightTable.rows[rowIndex - 1].cells[2].textContent) || 0;
    
            console.log("Planche Bas/Haut: ", plancheBasHaut);

            // Appliquer la nouvelle formule pour les tiroirs suivants le premier
            if (!plancheBasHaut || hauteurFacadeReelle === 0) {
                valeurEmplacementCoulisses = '';
            } else if (["pb & ph", "pb"].includes(plancheBasHaut)) {
                valeurEmplacementCoulisses = espaceFacade === "pdm" ? hauteurFacadeReelle + 59 : hauteurFacadeReelle + 23;
            } else {
                valeurEmplacementCoulisses = espaceFacade === "pdm" ? hauteurFacadeReelle + 78 : hauteurFacadeReelle + 42;
            }
        }
    
        // Mise à jour de la cellule "Emplacement Coulisses"
        const emplacementCoulissesCell = rightTable.rows[rowIndex].cells[3];
        emplacementCoulissesCell.textContent = valeurEmplacementCoulisses;
    }
    
    
    
    
    
    
    

    // Met à jour la somme des "Hauteurs Façade" et ajuste la couleur du texte si nécessaire
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

    // Fonction pour mettre à jour tout le tableau
    function updateAll() {
        updateDrawerRows(nbTiroirsInput.value);
        updateSumHauteursFacade();
    }

    // Attachez les gestionnaires d'événements à tous les inputs et selects du premier tableau
    document.querySelectorAll('.left-table input, .left-table select').forEach(element => {
        element.addEventListener('change', updateAll);
    });

    // Initialisation du tableau avec la valeur de départ pour le nombre de tiroirs
    updateAll();
});

