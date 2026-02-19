let stats = {
    energie: 10,
    moral: 5,
    relations: 7,
    reputation: 8,
    stress: 2,
    avancement_affaire: 0,
    argent: 100,
    jour: 1
};

let cartesActions = [
    {
        id: "dormir",
        nom: "Dormir 8h",
        cout: { temps: 8, argent: 0 },
        effet: { energie: +5, moral: +1 },
        texte: "Une nuit réparatrice. Les cauchemars attendront demain."
    },
    {
        id: "fouiller_illégal",
        nom: "Fouiller illégalement",
        cout: { energie: 3, reputation: -1 },
        effet: { avancement_affaire: +15, stress: +2 },
        texte: "Un indice crucial... mais votre badge brille moins fort."
    },
    {
        id: "boire",
        nom: "Boire un verre",
        cout: { argent: 2, energie: 1 },
        effet: { moral: +1, reputation: -1 },
        texte: "L'alcool noie les soucis... et la réputation."
    },
    {
        id: "travailler_maison",
        nom: "Travailler depuis la maison",
        cout: { energie: 2 },
        effet: { avancement_affaire: +5, relations: +1 },
        texte: "Vous avancez sur le dossier, mais votre enfant vous regarde avec tristesse."
    },
    {
        id: "appeler_ami",
        nom: "Appeler un ami",
        cout: { temps: 1, argent: 1 },
        effet: { moral: +2, relations: +1 },
        texte: "Une voix amicale dans la tempête."
    }
];

let evenementsQuotidiens = [
    {
        id: "menace_suspect",
        texte: "Un suspect vous envoie une lettre avec une balle dedans. *‘Arrête de fouiller.’*",
        effets: { moral: -2, stress: +3 },
        choix: [
            { texte: "Ignorer", effet: { avancement_affaire: -5 } },
            { texte: "Porter plainte", effet: { avancement_affaire: +10, relations: -1 } }
        ]
    },
    {
        id: "soutien_collegue",
        texte: "Un·e collègue vous offre un café. *‘Tu as l’air crevé·e.’*",
        effets: { moral: +1, energie: +1 }
    },
    {
        id: "enfant_malade",
        texte: "Votre enfant est malade. L’emmener chez le médecin ?",
        effets: { stress: +2 },
        choix: [
            { texte: "Prendre la journée", effet: { energie: -3, relations: +2, avancement_affaire: -5 } },
            { texte: "Laisser votre conjoint·e gérer", effet: { relations: -1 } }
        ]
    }
];

let evenementsLourds = [
    {
        id: "disparition_conjoint",
        texte: "Votre conjoint·e a disparu. Son dernier message : *‘Je ne peux plus vivre avec tes mensonges.’* La police vous regarde bizarrement.",
        effets: { moral: -5, relations: -5, stress: +4 }
    },
    {
        id: "article_presse",
        texte: "Un journal publie un article vous accusant de corruption. La photo est truquée... ou peut-être pas.",
        effets: { reputation: -4, stress: +3 }
    },
    {
        id: "suicide_collegue",
        texte: "Votre collègue se suicide dans le bureau. Il a laissé un mot : *‘Ils savent que tu sais.’*",
        effets: { moral: -4, stress: +5, reputation: -2 }
    }
];

// Mettre à jour l'affichage des ressources
function majRessources() {
    for (const [stat, valeur] of Object.entries(stats)) {
        if (stat !== "argent" && stat !== "jour") {
            document.getElementById(stat).value = valeur;
        }
    }
    document.getElementById("argent").textContent = stats.argent;
    document.getElementById("jour").textContent = `Jour ${stats.jour}`;
}

// Appliquer les effets d'une carte ou d'un événement
function appliquerEffets(effets) {
    for (const [stat, valeur] of Object.entries(effets)) {
        if (stats[stat] !== undefined) {
            stats[stat] += valeur;
            // Empêcher les valeurs négatives ou supérieures aux max
            if (stat !== "argent" && stat !== "avancement_affaire" && stat !== "stress") {
                stats[stat] = Math.max(0, Math.min(stats[stat], 10));
            }
            if (stat === "stress") {
                stats[stat] = Math.max(0, stats[stat]);
            }
        }
    }
    majRessources();
    verifierSeuilsCritiques();
}

// Vérifier les seuils critiques (fin de partie)
function verifierSeuilsCritiques() {
    if (stats.energie <= 0) {
        alert("Effondrement physique. Fin de partie.");
        reinitialiser();
    }
    if (stats.moral <= 0) {
        alert("Burn-out. Vous ne pouvez plus continuer. Fin de partie.");
        reinitialiser();
    }
    if (stats.relations <= 0) {
        alert("Votre famille vous a quitté. Fin de partie.");
        reinitialiser();
    }
    if (stats.avancement_affaire >= 100) {
        alert("Vous avez résolu l'affaire... mais à quel prix ?");
        reinitialiser();
    }
}

// Réinitialiser le jeu
function reinitialiser() {
    if (confirm("Recommencer ?")) {
        stats = {
            energie: 10,
            moral: 5,
            relations: 7,
            reputation: 8,
            stress: 2,
            avancement_affaire: 0,
            argent: 100,
            jour: 1
        };
        majRessources();
        piocherCartes();
    }
}

// Piocher des cartes actions et un événement
function piocherCartes() {
    const actionsContainer = document.getElementById("cartes-actions");
    actionsContainer.innerHTML = cartesActions
        .sort(() => 0.5 - Math.random())
        .slice(0, 3)
        .map(carte =>
            `<div class="carte" onclick="jouerCarte('${carte.id}')">
                <strong>${carte.nom}</strong><br>${carte.texte}
            </div>`
        )
        .join("");

    // Piocher un événement quotidien
    const event = evenementsQuotidiens[Math.floor(Math.random() * evenementsQuotidiens.length)];
    document.getElementById("evenement").innerHTML =
        `<p>${event.texte}</p>
        ${event.choix ? event.choix.map(choix =>
            `<button onclick="appliquerEffets(${JSON.stringify(choix.effet)})">${choix.texte}</button>`
        ).join(" ") : ""}`;
    appliquerEffets(event.effets || {});
}

// Jouer une carte action
function jouerCarte(idCarte) {
    const carte = cartesActions.find(c => c.id === idCarte);
    if (carte) {
        // Vérifier si le joueur peut payer le coût
        let peutJouer = true;
        for (const [ressource, cout] of Object.entries(carte.cout || {})) {
            if (stats[ressource] < cout) {
                peutJouer = false;
                alert(`Pas assez de ${ressource} !`);
                break;
            }
        }
        if (peutJouer) {
            // Appliquer le coût
            for (const [ressource, cout] of Object.entries(carte.cout || {})) {
                stats[ressource] -= cout;
            }
            // Appliquer l'effet
            appliquerEffets(carte.effet || {});
            // Rafraîchir l'affichage
            majRessources();
            piocherCartes();
        }
    }
}

// Terminer la journée
function terminerJournee() {
    stats.jour++;
    if (stats.jour % 10 === 0) {
        // Déclencher un événement lourd tous les 10 jours
        const eventLourd = evenementsLourds[Math.floor(Math.random() * evenementsLourds.length)];
        document.getElementById("evenement").innerHTML =
            `<p style="color: #f00; font-weight: bold;">${eventLourd.texte}</p>`;
        appliquerEffets(eventLourd.effets || {});
    } else {
        piocherCartes();
    }
}

// Démarrer le jeu
piocherCartes();
majRessources();
