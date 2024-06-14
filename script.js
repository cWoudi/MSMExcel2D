/**
 * Exporte les données de dimensions des tiroirs en fichier CSV.
 * @param {string} filename - Le nom du fichier CSV à générer.
 */
function exportTableToCSV(filename) {
    // Sélection du corps du tableau où les dimensions sont affichées
    const drawerDimensionsBody = document.getElementById('drawerDimensionsBody');
    if (!drawerDimensionsBody) {
        console.error('Table body for drawer dimensions not found');
        return;
    }

    // Préparation de la chaîne de début du fichier CSV avec en-tête UTF-8
    let csvContent = "data:text/csv;charset=utf-8,";
    // Ajout des en-têtes des colonnes du CSV
    csvContent += "Length,Width,Qty,Label,Enabled\n"; // Entêtes CSV

    const rows = drawerDimensionsBody.querySelectorAll('tr');
    let tiroirCount = 1; // Compteur pour les numéros de tiroir

    // Boucler sur les rangées deux par deux
    for (let i = 0; i < rows.length; i += 2) {
        const rowDevanture = rows[i];
        const rowCote = rows[i + 1];

        // Parcourir chaque couple de lignes (devanture et côté)
        if (rowDevanture && rowCote) {
            // Récupérer les dimensions pour la devanture
            const devantureDimensions = rowDevanture.cells[2].textContent;
            const devantureParts = devantureDimensions.split(' x ');
            if (devantureParts.length === 2) {
                const lengthDevanture = Math.floor(parseFloat(devantureParts[0]));
                const widthDevanture = Math.floor(parseFloat(devantureParts[1].replace(' mm', '')));

                const csvRowDevanture = `${lengthDevanture},${widthDevanture},2,Devanture Tiroir ${tiroirCount},TRUE\n`;
                csvContent += csvRowDevanture;
            }

            // Récupérer les dimensions pour le côté
            const coteDimensions = rowCote.cells[1].textContent;
            const coteParts = coteDimensions.split(' x ');
            if (coteParts.length === 2) {
                const lengthCote = Math.floor(parseFloat(coteParts[0]));
                const widthCote = Math.floor(parseFloat(coteParts[1].replace(' mm', '')));

                const csvRowCote = `${lengthCote},${widthCote},2,Côté Tiroir ${tiroirCount},TRUE\n`;
                csvContent += csvRowCote;
            }

            // Incrémenter le numéro de tiroir après chaque couple de lignes
            tiroirCount++;
        }
    }

    // Encodage et création du lien pour le téléchargement
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link); // Ajout du lien au document
    link.click(); // Déclenchement du téléchargement
    document.body.removeChild(link); // Suppression du lien après usage
}

/**
 * Le gestionnaire d'événements `DOMContentLoaded` s'assure que le script s'exécute seulement après le chargement complet du DOM de la page HTML.
 */
document.addEventListener('DOMContentLoaded', () => {
    // Sélectionne l'élément input de hauteur du meuble et le stocke dans une variable.
    const hauteurMeubleInput = document.querySelector('#hauteurMeuble');
    // Sélectionne l'élément input de largeur du meuble et le stocke dans une variable.
    const largeurMeubleInput = document.querySelector('#largeurMeuble');
    // Sélectionne l'élément input du nombre de tiroirs et le stocke dans une variable.
    const nbTiroirsInput = document.querySelector('#nbTiroirs');
    // Sélectionne l'élément select de l'espace de façade et le stocke dans une variable.
    const espaceFacadeSelect = document.querySelector('#espaceFacade');
    // Sélectionne le corps de la table de droite où seront affichés les tiroirs et le stocke dans une variable.
    const rightTable = document.querySelector('.right-table tbody');
    // Sélectionne l'élément qui affichera la somme des hauteurs de façade et le stocke dans une variable.
    const sumElement = document.querySelector('#sumHauteursFacade');
    // Sélectionne l'en-tête de colonne pour la hauteur de façade réelle et le stocke dans une variable.
    const hauteurFacadeHeader = document.querySelector('.right-table th:nth-child(2)');

/**
 * Calcule les longueurs possibles de coulisses pour un tiroir donné en fonction de la profondeur du meuble,
 * de l'option tiroir à l'anglaise, et de l'encastrement sélectionné.
 * @param {HTMLElement} row - L'élément HTML de la ligne du tableau représentant un tiroir.
 * @returns {Array<number>} - Un tableau des longueurs de coulisses possibles qui respectent les contraintes définies.
 */
function calculateLongueurCoulisses(row) {
    // Récupère la valeur de la profondeur du meuble depuis l'entrée utilisateur ou utilise 300 par défaut.
    const profondeurMeuble = parseFloat(document.getElementById('profondeurMeuble').value) || 300; 

    // Détermine si l'option tiroir à l'anglaise est cochée pour ce tiroir.
    const tiroirAnglaise = row.querySelector('.tiroir-anglaise') ? row.querySelector('.tiroir-anglaise').checked : false;

    // Récupère la sélection de l'encastrement pour ce tiroir.
    const encastréSelect = row.querySelector('.encastré');
    const encastré = encastréSelect ? encastréSelect.value : 'none';

    // Définit une réduction de base due à des contraintes de construction du meuble.
    let baseReduction = 25;
    // Initialisation de la réduction supplémentaire basée sur des options spécifiques.
    let additionalReduction = 0;
    // Ajoute 25 mm de réduction si le tiroir est à l'anglaise.
    if (tiroirAnglaise) additionalReduction += 25;
    // Ajoute 63 mm de réduction si l'encastrement est de type '2c'.
    if (encastré === '2c') additionalReduction += 63;

    // Calcule la longueur maximale de coulisse possible après application des réductions.
    const maxLength = profondeurMeuble - baseReduction - additionalReduction;
    // Définit les longueurs standard de coulisses disponibles.
    const possibleLengths = [270, 300, 350, 400, 450, 500, 550, 600];
    // Retourne les longueurs de coulisses qui sont inférieures ou égales à la longueur maximale calculée.
    return possibleLengths.filter(length => length <= maxLength);
}

   
    /**
 * Met à jour le tableau affichant les configurations des tiroirs en fonction des entrées de l'utilisateur.
 * Gère dynamiquement la création de lignes dans le tableau pour configurer chaque tiroir
 * et définit des gestionnaires d'événements pour gérer les modifications.
 */
    function updateDrawerRows() {
    // Récupère le nombre total de tiroirs à partir de l'entrée de l'utilisateur.
    const numberOfDrawers = parseInt(nbTiroirsInput.value) || 0;
    // Récupère la hauteur totale du meuble saisie par l'utilisateur.
    const hauteurMeuble = parseFloat(hauteurMeubleInput.value) || 0;
    // Calcule la hauteur par défaut de chaque façade de tiroir en divisant la hauteur du meuble par le nombre de tiroirs.
    const defaultHauteurFacade = hauteurMeuble / numberOfDrawers;
    // Variable pour vérifier la validité de toutes les hauteurs de façade saisies.
    let isValid = true;
    
    // Efface toutes les lignes existantes dans le tableau de droite avant d'ajouter de nouvelles.
    while (rightTable.firstChild) {
            rightTable.removeChild(rightTable.firstChild);
        }
    
        // Crée un élément select pour l'option d'encastrement avec ses options.
        const encastréSelect = document.createElement('select');
        encastréSelect.className = 'encastré';
        const option0C = new Option('0C', '0c');
        const option1C = new Option('1C', '1c');
        const option2C = new Option('2C', '2c');
        encastréSelect.add(option0C, undefined);
        encastréSelect.add(option1C, undefined);
        encastréSelect.add(option2C, undefined);
        const encastréCell = document.createElement('td');
        encastréCell.appendChild(encastréSelect);
        encastréCell.rowSpan = numberOfDrawers; 
        encastréCell.addEventListener('change', () => {
            drawMeuble();
            updateThirdTable();
        });

        // Boucle pour créer une ligne pour chaque tiroir selon le nombre spécifié.
        for (let i = 0; i < numberOfDrawers; i++) {
            const row = rightTable.insertRow();
            // Ajoute une étiquette pour chaque tiroir, indiquant s'il est en haut ou en bas si nécessaire.
            const label = `Tiroir ${i + 1}` + (i === 0 ? " (Bas)" : "") + (i === numberOfDrawers - 1 ? " (Haut)" : "");
            row.insertCell(0).textContent = label;
    
            // Crée et configure un input pour la hauteur de façade de chaque tiroir.   
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
    
            // Affiche la hauteur réelle calculée de la façade du tiroir.
            const hauteurFacadeReelleCell = row.insertCell(2);
            hauteurFacadeReelleCell.textContent = hauteursFacadeInput.value;
    
            // Initialise l'emplacement des coulisses à zéro, sera recalculé plus tard.
            const emplacementCoulissesCell = row.insertCell(3);
            emplacementCoulissesCell.textContent = '0.00';
    
            // Calculs initiaux pour la configuration du tiroir.
            calculateHauteurFacadeReelle(hauteursFacadeInput, i);
            calculateEmplacementCoulisses(i);
    
            // Vérifie si la hauteur de façade est conforme aux exigences.
            if (parseFloat(hauteursFacadeInput.value) < 80) {
                isValid = false;
            }
    
            // Gère le choix du tiroir à l'anglaise pour chaque tiroir.
            const tiroirAnglaiseCell = row.insertCell(4);
            const tiroirAnglaiseCheckbox = document.createElement('input');
            tiroirAnglaiseCheckbox.type = 'checkbox';
            tiroirAnglaiseCheckbox.className = 'tiroir-anglaise';
            tiroirAnglaiseCheckbox.disabled = (i === 0); // Le premier tiroir ne peut être à l'anglaise.
            tiroirAnglaiseCheckbox.addEventListener('change', (e) => {
                handleAnglaiseChange(e.target, i);
            });
            tiroirAnglaiseCell.appendChild(tiroirAnglaiseCheckbox);
    
            if (i === 0) {
                row.appendChild(encastréCell);
            }

            // Gère les longueurs des coulisses pour chaque tiroir.
            const validLengths = calculateLongueurCoulisses(row);
            const lgCoulissesCell = row.insertCell();
            const lgCoulissesSelect = document.createElement('select');
            lgCoulissesSelect.className = 'lg-coulisses';
            validLengths.forEach(length => {
                const option = new Option(length, length);
                lgCoulissesSelect.add(option);
            });
            lgCoulissesSelect.value = validLengths.length > 0 ? Math.max(...validLengths) : "N/A";
            lgCoulissesCell.appendChild(lgCoulissesSelect);

            // Gère la hauteur des côtés pour chaque tiroir.
            const hauteurCoteInput = document.createElement('input');
            hauteurCoteInput.type = 'number';
            hauteurCoteInput.className = 'hauteurCote';
            hauteurCoteInput.value = 150; // Valeur par défaut.
            hauteurCoteInput.min = 70; // Valeur minimale.
            hauteurCoteInput.max = parseFloat(hauteurFacadeReelleCell.textContent) - 10;  // Valeur maximale basée sur la hauteur de façade.
            if (parseFloat(hauteurCoteInput.value) > hauteurCoteInput.max) {
                hauteurCoteInput.value = hauteurCoteInput.max;
            }
            row.insertCell().appendChild(hauteurCoteInput);
    
            hauteurCoteInput.addEventListener('input', () => {
                if (parseFloat(hauteurCoteInput.value) > hauteurCoteInput.max) {
                    hauteurCoteInput.value = hauteurCoteInput.max;
                    updateThirdTable()
                }
            });
            hauteurCoteInput.addEventListener('change', () => {
                updateThirdTable();
            });

        }

        // Affiche un message d'erreur si une hauteur de façade n'est pas conforme.
        const heightError = document.getElementById('heightError');
        heightError.style.display = isValid ? 'none' : 'block';
        drawMeuble(); 
    }

/**
 * Cette fonction met à jour le tableau des dimensions des composants des tiroirs en réponse à des modifications
 * dans les configurations des tiroirs. Elle calcule les dimensions de la devanture et des côtés de chaque tiroir
 * en fonction de l'encastrement sélectionné et des dimensions saisies par l'utilisateur.
 */
function updateThirdTable() {
    // Accès à l'élément DOM du corps du tableau des dimensions des tiroirs.
    const drawerDimensionsBody = document.getElementById('drawerDimensionsBody');
    if (!drawerDimensionsBody) {
        console.error('Table body for drawer dimensions not found');
        return; // Stoppe la fonction si l'élément n'est pas trouvé pour éviter des erreurs.
    }

    drawerDimensionsBody.innerHTML = ''; // Efface le contenu précédent du tableau pour une mise à jour complète.
    
    // Récupération du réglage d'encastrement depuis le formulaire.
    const encastrementSelect = document.querySelector('.encastré');
    const encastrement = encastrementSelect ? encastrementSelect.value : '0c'; // Sécurise avec une valeur par défaut.

    // Parcourt toutes les lignes du tableau de configuration des tiroirs pour recalculer les dimensions.
    const rows = rightTable.querySelectorAll('tr');
    const rowCount = rows.length; // Nombre total de tiroirs configurés.
    rows.forEach((row, index) => {
        // Sélection des éléments nécessaires à partir de chaque ligne du tableau.
        const hauteurCoteInput = row.querySelector('.hauteurCote');
        const lgCoulissesSelect = row.querySelector('.lg-coulisses');

        // Vérifie la présence des inputs nécessaires pour éviter des erreurs.
        if (!hauteurCoteInput || !lgCoulissesSelect) {
            console.error('Required inputs not found in row', index);
            return; // Passe à la prochaine itération si les éléments nécessaires ne sont pas trouvés.
        }

        // Conversion des valeurs récupérées en nombre.
        const hauteurCote = parseFloat(hauteurCoteInput.value);
        const lgCoulisses = parseFloat(lgCoulissesSelect.value);

        // Calcul de la largeur du meuble ajustée selon l'encastrement.
        let largeurDuMeuble;
        switch (encastrement) {
            case '0c':
                largeurDuMeuble = 48;
                break;
            case '1c':
                largeurDuMeuble = 88;
                break;
            case '2c':
                largeurDuMeuble = 128;
                break;
            default:
                largeurDuMeuble = 48; // Valeur par défaut en cas de valeur non reconnue.
        }

        const devantureL = (largeurMeubleInput.value) - largeurDuMeuble;
        const devantureH = hauteurCote - 30; // Ajustement de la hauteur en déduisant un espace fixe.
        const côtéL = lgCoulisses - 10; // Réduction de la longueur pour l'ajustement.
        const côtéH = hauteurCote; // Hauteur utilisée telle quelle pour le côté.

        // Génération des étiquettes avec distinction spéciale pour le premier et le dernier tiroir.
        const label = `Tiroir ${index + 1}` + (index === 0 ? " (Bas)" : "") + (index === rowCount - 1 ? " (Haut)" : "");

        // Ajout de la ligne pour la devanture dans le tableau.
        const rowDevanture = drawerDimensionsBody.insertRow();
        const tiroirCell = rowDevanture.insertCell(0);
        tiroirCell.textContent = label;
        tiroirCell.rowSpan = 2; // Fait que la cellule 'Tiroir X' englobe deux lignes.

        // Ajout de l'image et des dimensions de la devanture.
        const imgCellDevanture = rowDevanture.insertCell(1);
        const imgDevanture = document.createElement('img');
        imgDevanture.src = 'img/devanture.png';
        imgDevanture.alt = 'Devanture';
        imgCellDevanture.appendChild(imgDevanture);
        rowDevanture.insertCell(2).textContent = `${devantureL.toFixed(1)} x ${devantureH.toFixed(1)} mm`;

        // Ajout de la ligne pour les côtés dans le tableau.
        const rowCote = drawerDimensionsBody.insertRow();
        const imgCellCote = rowCote.insertCell(0);
        const imgCote = document.createElement('img');
        imgCote.src = 'img/cote.png';
        imgCote.alt = 'Côté';
        imgCellCote.appendChild(imgCote);
        rowCote.insertCell(1).textContent = `${côtéL.toFixed(1)} x ${côtéH.toFixed(1)} mm`;
    });
}

    /**
 * Gère les modifications des options de tiroir à l'anglaise, affectant les dimensions de façade.
 * Cette fonction est appelée lorsqu'un utilisateur coche ou décoche l'option de tiroir à l'anglique pour un tiroir spécifique.
 * 
 * @param {HTMLInputElement} checkbox - La case à cocher qui détermine si le tiroir à l'anglaise est sélectionné.
 * @param {number} rowIndex - L'index de la ligne dans le tableau qui correspond au tiroir concerné.
 */
function handleAnglaiseChange(checkbox, rowIndex) {
    // Accède à la ligne actuelle et aux cellules nécessaires du tableau pour obtenir les mesures actuelles.
    const currentRow = rightTable.rows[rowIndex];
    const currentHauteurFacadeReelleCell = currentRow.cells[2];
    const currentInputHauteursFacade = currentRow.cells[1].querySelector('input');
    
    // Détermine la ligne précédente pour les calculs d'ajustement.
    const previousRowIndex = rowIndex - 1;
    const previousRow = rightTable.rows[previousRowIndex];
    const previousHauteurFacadeReelleCell = previousRow?.cells[2];
    const previousInputHauteursFacade = previousRow?.cells[1].querySelector('input');
    
    // Si la case est cochée, réajuste les hauteurs de façade réelle pour refléter un montage encastré.
    if (checkbox.checked) {
        if (previousHauteurFacadeReelleCell) {
            // Combine les hauteurs des façades des tiroirs actuel et précédent.
            const currentValue = parseFloat(currentHauteurFacadeReelleCell.textContent) || 0;
            const previousValue = parseFloat(previousHauteurFacadeReelleCell.textContent) || 0;
            previousHauteurFacadeReelleCell.textContent = (currentValue + previousValue).toFixed(2);
            currentHauteurFacadeReelleCell.textContent = '0.00'; // Réinitialise la hauteur actuelle.
            currentHauteurFacadeReelleCell.style.backgroundColor = '#e0e0e0'; // Change de couleur pour indiquer le changement.
        }
    } else {
        // Si la case est décochée, rétablit les hauteurs selon les valeurs originales.
        if (previousHauteurFacadeReelleCell) {
            const originalCurrentHauteur = parseFloat(currentInputHauteursFacade.value) || 0;
    
            // Recalcule la hauteur de façade réelle précédente et ajuste l'actuelle.
            calculateHauteurFacadeReelle(previousInputHauteursFacade, previousRowIndex);
            const recalculatedPreviousValue = parseFloat(previousHauteurFacadeReelleCell.textContent) || 0;
    
            currentHauteurFacadeReelleCell.textContent = (originalCurrentHauteur - recalculatedPreviousValue).toFixed(2);
            currentHauteurFacadeReelleCell.style.backgroundColor = ''; // Retour à la couleur normale.
        }
    
        // Recalcule la hauteur de façade réelle actuelle.
        calculateHauteurFacadeReelle(currentInputHauteursFacade, rowIndex);
    }
    
    // Redessine le meuble pour mettre à jour l'affichage.
    drawMeuble(); 
}

    
    
    

/**
 * Vérifie si la hauteur saisie pour la façade est conforme aux exigences minimales.
 * Affiche un message d'erreur si la hauteur est inférieure au minimum requis.
 * 
 * @param {HTMLInputElement} inputElement - L'élément input où la hauteur de la façade est saisie.
 */
function checkFacadeHeight(inputElement) {
    // Récupère l'élément HTML qui affiche les erreurs de hauteur.
    const heightError = document.getElementById('heightError');

    // Convertit la valeur de l'input en un nombre flottant.
    const height = parseFloat(inputElement.value);

    // Vérifie si la hauteur saisie est inférieure à 80 mm.
    if (height < 80) {
        // Si la hauteur est insuffisante, affiche le message d'erreur.
        heightError.style.display = 'block';
    } else {
        // Si la hauteur est conforme, vérifie que toutes les hauteurs saisies sont valides.
        const allValid = Array.from(document.querySelectorAll('.hauteursFacade'))
                              .every(input => parseFloat(input.value) >= 80);

        // Cache le message d'erreur si toutes les hauteurs sont valides.
        if (allValid) {
            heightError.style.display = 'none';
        }
    }
}


/**
 * Calcule la hauteur réelle de la façade d'un tiroir en prenant en compte
 * l'espace entre les tiroirs et met à jour l'affichage correspondant dans le tableau.
 * 
 * @param {HTMLInputElement} inputHauteursFacade - L'élément input où l'utilisateur saisit la hauteur prévue pour la façade.
 * @param {number} rowIndex - L'index de la ligne correspondant au tiroir dans le tableau de droite.
 */
function calculateHauteurFacadeReelle(inputHauteursFacade, rowIndex) {
    // Récupère la hauteur totale du meuble et le nombre de tiroirs à partir des éléments input du document.
    const hauteurMeuble = parseFloat(hauteurMeubleInput.value) || 0;
    const nombreDeTiroirs = parseInt(nbTiroirsInput.value) || 0;

    // Récupère le type d'espace entre façades choisi dans le menu déroulant et la hauteur de façade saisie par l'utilisateur.
    const espaceFacade = espaceFacadeSelect.value.toLowerCase();
    const hauteurFacade = parseFloat(inputHauteursFacade.value) || 0;

    let hauteurFacadeReelle = 0;

    // Calcule la hauteur réelle en fonction de l'espace entre les façades.
    if (espaceFacade === "pdm") {
        // Si l'option 'pdm' est sélectionnée, un espace plus grand est considéré.
        hauteurFacadeReelle = (hauteurMeuble - (22 * (nombreDeTiroirs - 1))) * (hauteurFacade / hauteurMeuble);
    } else {
        // Pour l'option 'normal', un espace standard est utilisé.
        hauteurFacadeReelle = (hauteurMeuble - (2 * (nombreDeTiroirs - 1))) * (hauteurFacade / hauteurMeuble);
    }

    // Met à jour la cellule correspondante dans le tableau avec la hauteur réelle calculée, arrondie à deux décimales.
    const hauteurFacadeReelleCell = rightTable.rows[rowIndex].cells[2];
    hauteurFacadeReelleCell.textContent = hauteurFacadeReelle.toFixed(2);

    // Appelle les fonctions pour mettre à jour la somme des hauteurs de façade et redessiner le meuble.
    updateSumHauteursFacade();
    drawMeuble(); 
}


// Cette fonction calcule l'emplacement des coulisses pour chaque tiroir dans la table.
function calculateEmplacementCoulisses(rowIndex) {
    // Récupère la valeur de la configuration de la planche basse/haute.
    const plancheBasHaut = document.querySelector('#plancheBasHaut').value;
    // Récupère le type d'espace entre façades.
    const espaceFacade = espaceFacadeSelect.value;
    let hauteurFacadeReelle;

    // Premier tiroir : calculs spécifiques car pas de tiroir au-dessus.
    if (rowIndex === 0) {
        // Obtient la hauteur façade réelle du premier tiroir.
        hauteurFacadeReelle = parseFloat(rightTable.rows[rowIndex].cells[2].textContent) || 0;
        // Si les informations nécessaires sont manquantes, aucun calcul n'est possible.
        if (!hauteurFacadeReelle || !espaceFacade || !plancheBasHaut) {
            valeurEmplacementCoulisses = '';
        } else if (espaceFacade.toLowerCase() === 'pdm' && (plancheBasHaut === 'ph' || plancheBasHaut === 'aucun')) {
            // Configuration particulière nécessitant un décalage fixe.
            valeurEmplacementCoulisses = 59;
        } else {
            // Décalage standard.
            valeurEmplacementCoulisses = 37;
        }
    } else if (rowIndex === 1) {
        // Deuxième tiroir : dépend du premier pour le calcul de l'emplacement.
        hauteurFacadeReelle = parseFloat(rightTable.rows[rowIndex - 1].cells[2].textContent) || 0;
        if (!plancheBasHaut || hauteurFacadeReelle === 0) {
            valeurEmplacementCoulisses = '';
        } else if (["pb & ph", "pb"].includes(plancheBasHaut)) {
            // Calculs modifiés selon la configuration "pb" ou "pb & ph".
            valeurEmplacementCoulisses = espaceFacade === "pdm" ? hauteurFacadeReelle + 59 : hauteurFacadeReelle + 23;
        } else {
            // Autre configuration nécessitant un autre décalage.
            valeurEmplacementCoulisses = espaceFacade === "pdm" ? hauteurFacadeReelle + 78 : hauteurFacadeReelle + 42;
        }
    } else {
        // Tiroirs suivants : dépendent de la configuration des tiroirs au-dessus.
        hauteurFacadeReelle = parseFloat(rightTable.rows[rowIndex - 1].cells[2].textContent) || 0;
        let emplacementCoulissesPrecedent = parseFloat(rightTable.rows[rowIndex - 1].cells[3].textContent) || 0;
        if (!emplacementCoulissesPrecedent || hauteurFacadeReelle === 0) {
            valeurEmplacementCoulisses = '';
        } else {
            // Configuration pdm ou standard pour l'emplacement des autres coulisses.
            valeurEmplacementCoulisses = espaceFacade === "pdm" ? emplacementCoulissesPrecedent + hauteurFacadeReelle + 22 : emplacementCoulissesPrecedent + hauteurFacadeReelle + 2;
        }
    }

    // Met à jour l'affichage de l'emplacement des coulisses dans la table.
    const emplacementCoulissesCell = rightTable.rows[rowIndex].cells[3];
    emplacementCoulissesCell.textContent = valeurEmplacementCoulisses.toFixed(2);
    drawMeuble(); // Redessine le meuble pour refléter les nouveaux calculs.
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
    
        ctx.strokeRect(startX, startY, scaledWidth, scaledHeight);
    
        const encastréSelect = document.querySelector('.encastré');
        const encastréValue = encastréSelect ? encastréSelect.value : '0c';
    
        const rows = rightTable.querySelectorAll('tr');
        rows.forEach(row => {
            const emplacement = parseFloat(row.cells[3].textContent) || 0;
            const emplacementHeight = startY + scaledHeight - (emplacement * scaleFactor);
    
            let offset = 37;
    
            const tiroirAnglaiseCheckbox = row.querySelector('.tiroir-anglaise');
            if (tiroirAnglaiseCheckbox && tiroirAnglaiseCheckbox.checked) {
                offset += 25;
            }
    
            if (encastréValue === '1c' || encastréValue === '2c') {
                offset += 63; 
            }
    
            ctx.beginPath();
            ctx.setLineDash([5, 5]);
            ctx.moveTo(startX + (offset * scaleFactor), emplacementHeight); 
            ctx.lineTo(startX + scaledWidth, emplacementHeight);
            ctx.stroke();
            ctx.fillText(`${emplacement} mm (${offset} mm)`, startX + scaledWidth + 5, emplacementHeight);
        });
    
        ctx.setLineDash([]);
        ctx.textAlign = 'center';
        ctx.fillText(`Largeur: ${largeurMeuble} mm`, canvas.width / 2, startY + scaledHeight + 20);
    
        // Rotation pour le texte vertical de la hauteur
        ctx.save(); // Sauvegarde l'état du contexte
        ctx.translate(startX - 10, startY + scaledHeight / 2);
        ctx.rotate(-Math.PI / 2); // Rotation de 90 degrés dans le sens antihoraire
        ctx.textAlign = 'center';
        ctx.fillText(`Hauteur: ${hauteurMeuble} mm`, 0, 0);
        ctx.restore(); // Restaure l'état du contexte
    
        ctx.textAlign = 'start'; // Réinitialiser l'alignement du texte si nécessaire
    }
    
    
    
// Ajoute un écouteur d'événement sur le champ de saisie de la hauteur du meuble.
// Lorsque la valeur de hauteur du meuble est modifiée, la fonction drawMeuble est appelée pour redessiner le meuble.
hauteurMeubleInput.addEventListener('input', drawMeuble);

// Ajoute un écouteur d'événement sur le champ de saisie de la largeur du meuble.
// Lorsque la valeur de largeur du meuble est modifiée, la fonction drawMeuble est également appelée.
document.querySelector('#largeurMeuble').addEventListener('input', drawMeuble); 

// Ajoute un écouteur d'événement sur le champ de saisie du nombre de tiroirs.
// Lorsque le nombre de tiroirs est changé, la fonction drawMeuble est déclenchée pour ajuster le dessin du meuble selon le nouveau nombre de tiroirs.
nbTiroirsInput.addEventListener('change', drawMeuble); 

    
    
/**
 * Calcule et affiche la somme des hauteurs de façade des tiroirs et vérifie
 * si cette somme correspond à la hauteur totale du meuble.
 */
function updateSumHauteursFacade() {
    let sum = 0; // Initialisation de la somme des hauteurs de façade
    
    // Parcours de chaque input de hauteur de façade et accumulation des valeurs
    rightTable.querySelectorAll('.hauteursFacade').forEach(input => {
        sum += parseFloat(input.value) || 0; // Ajoute à la somme, en traitant les non-numériques comme 0
    });
    
    // Affichage de la somme des hauteurs arrondie à deux décimales
    sumElement.textContent = sum.toFixed(2);
    
    // Calcul de la hauteur totale du meuble saisie
    const hauteurMeuble = parseFloat(hauteurMeubleInput.value) || 0;
    
    // Comparaison de la somme des hauteurs de façade avec la hauteur totale du meuble
    if (Math.abs(sum - hauteurMeuble) > 0.03) { // Si la différence est supérieure à 0.03
        sumElement.style.color = 'red'; // Indique une erreur en rouge
        hauteurFacadeHeader.style.color = 'red'; // Colore l'entête correspondant en rouge
    } else {
        sumElement.style.color = 'black'; // Sinon, remet la couleur normale (noir)
        hauteurSade = 'black'; // Remet la couleur de l'entête en noir
    }
}

    

    function updateAll() {
        updateDrawerRows();
        updateThirdTable();
        updateSumHauteursFacade();
    }

    document.querySelectorAll('.left-table input, .left-table select').forEach(element => {
        element.addEventListener('change', updateAll);
    });

    updateAll();
});