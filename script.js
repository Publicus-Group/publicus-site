/* ================================================================
   PUBLICUS GROUP — script.js
   Fichier JS Unique · Partagé par les 4 pages HTML
   ----------------------------------------------------------------
   TABLE DES MATIÈRES :
   1.  Initialisation (DOMContentLoaded)
   2.  Navigation — Scroll effect + Burger menu
   3.  Lien actif automatique dans la navbar
   4.  Scroll Reveal — IntersectionObserver
   5.  Compteur de statistiques animé
   6.  Validation et envoi du formulaire de contact
   7.  Parallaxe léger sur le Hero
   8.  Lueur qui suit le curseur (desktop)
   9.  Utilitaire global : Toast notification
   ================================================================ */

'use strict';

/* ================================================================
   1. INITIALISATION
      Tout le code s'exécute après le chargement du DOM
   ================================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* Lance chaque module indépendamment */
  initNavigation();
  initLienActif();
  initScrollReveal();
  initCompteurs();
  initFormulaireContact();
  initParallaxe();
  initLueurCurseur();

});


/* ================================================================
   2. NAVIGATION
      - Effet de flou quand l'utilisateur scrolle
      - Menu burger mobile (ouvrir / fermer)
      - Fermeture avec touche Échap
   ================================================================ */

function initNavigation() {

  const navbar     = document.querySelector('.navbar');
  const burger     = document.querySelector('.burger');
  const menuMobile = document.querySelector('.menu-mobile');

  /* Quitte silencieusement si les éléments n'existent pas */
  if (!navbar) return;

  /* ── Effet scroll sur la navbar ── */
  const gererScroll = () => {
    if (window.scrollY > 45) {
      navbar.classList.add('scrollee');
    } else {
      navbar.classList.remove('scrollee');
    }
  };

  /* passive:true améliore les performances sur mobile */
  window.addEventListener('scroll', gererScroll, { passive: true });

  /* Vérifier l'état initial au chargement */
  gererScroll();


  /* ── Burger menu ── */
  if (!burger || !menuMobile) return;

  const ouvrirMenu = () => {
    burger.classList.add('ouvert');
    menuMobile.classList.add('ouvert');
    document.body.style.overflow = 'hidden';   /* Bloque le scroll de la page */
    burger.setAttribute('aria-expanded', 'true');
  };

  const fermerMenu = () => {
    burger.classList.remove('ouvert');
    menuMobile.classList.remove('ouvert');
    document.body.style.overflow = '';   /* Réactive le scroll */
    burger.setAttribute('aria-expanded', 'false');
  };

  /* Basculer au clic du burger */
  burger.addEventListener('click', () => {
    menuMobile.classList.contains('ouvert') ? fermerMenu() : ouvrirMenu();
  });

  /* Fermer quand on clique sur un lien du menu mobile */
  menuMobile.querySelectorAll('a').forEach(lien => {
    lien.addEventListener('click', fermerMenu);
  });

  /* Fermer avec la touche Échap */
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menuMobile.classList.contains('ouvert')) {
      fermerMenu();
    }
  });

}


/* ================================================================
   3. LIEN ACTIF
      Détecte la page courante et ajoute la classe "actif"
      sur le lien de navigation correspondant
   ================================================================ */

function initLienActif() {

  /* Récupère le nom du fichier (ex: "services.html") */
  const pageCourante = window.location.pathname.split('/').pop() || 'index.html';

  /* Sélectionne tous les liens de la navbar et du menu mobile */
  const tousLesLiens = document.querySelectorAll('.nav-liens a, .menu-mobile a[href]');

  tousLesLiens.forEach(lien => {
    const href = lien.getAttribute('href');

    /* Compare le href avec le nom de la page courante */
    const estActif =
      href === pageCourante ||
      (pageCourante === '' && href === 'index.html') ||
      (pageCourante === '/' && href === 'index.html');

    if (estActif) {
      lien.classList.add('actif');
      lien.setAttribute('aria-current', 'page');
    }
  });

}


/* ================================================================
   4. SCROLL REVEAL — IntersectionObserver
      Les éléments avec .revele, .revele-gauche, .revele-droite
      deviennent visibles en entrant dans le viewport
   ================================================================ */

function initScrollReveal() {

  /* Configuration de l'observer */
  const config = {
    threshold:  0.13,             /* L'élément doit être visible à 13% */
    rootMargin: '0px 0px -50px 0px'  /* Déclenche un peu avant d'atteindre le bas */
  };

  const observateur = new IntersectionObserver((entrees) => {
    entrees.forEach(entree => {
      if (entree.isIntersecting) {
        /* Ajoute la classe "visible" → déclenche l'animation CSS */
        entree.target.classList.add('visible');
      }
    });
  }, config);

  /* Observe tous les éléments animables */
  const selecteurs = '.revele, .revele-gauche, .revele-droite';
  document.querySelectorAll(selecteurs).forEach(el => {
    observateur.observe(el);
  });

}


/* ================================================================
   5. COMPTEUR DE STATISTIQUES ANIMÉ
      Les éléments [data-cible] comptent de 0 jusqu'à la valeur
      cible en utilisant une animation d'easing fluide
   ================================================================ */

function initCompteurs() {

  /* Fonction d'animation d'un compteur individuel */
  const animer = (element, cible, suffixe = '', duree = 2000) => {
    const debut = performance.now();

    const frame = (tempsActuel) => {
      const elapsed  = tempsActuel - debut;
      const progress = Math.min(elapsed / duree, 1);

      /* Easing "ease-out-cubic" pour un ralentissement naturel */
      const eased = 1 - Math.pow(1 - progress, 3);
      const valeur = Math.floor(eased * cible);

      element.textContent = valeur + suffixe;

      if (progress < 1) {
        requestAnimationFrame(frame);
      } else {
        /* Valeur finale exacte */
        element.textContent = cible + suffixe;
      }
    };

    requestAnimationFrame(frame);
  };

  /* Observer les compteurs — ils se lancent quand ils deviennent visibles */
  const observateur = new IntersectionObserver((entrees) => {
    entrees.forEach(entree => {
      if (entree.isIntersecting && !entree.target.dataset.compte) {
        entree.target.dataset.compte = 'true';   /* Évite de relancer l'animation */

        const cible  = parseInt(entree.target.dataset.cible);
        const suffixe = entree.target.dataset.suffixe || '';

        animer(entree.target, cible, suffixe);
      }
    });
  }, { threshold: 0.6 });

  document.querySelectorAll('[data-cible]').forEach(el => {
    observateur.observe(el);
  });

}


/* ================================================================
   6. FORMULAIRE DE CONTACT
      - Validation en temps réel (champ par champ)
      - Validation globale à la soumission
      - Simulation d'envoi avec feedback visuel
   ================================================================ */

function initFormulaireContact() {

  const formulaire = document.querySelector('#formulaire-contact');
  if (!formulaire) return;   /* Pas sur cette page → quitte */

  /* Tous les champs à valider */
  const champs = formulaire.querySelectorAll('.champ-input, .champ-textarea, .champ-select');

  /* ── Validation en temps réel (sur blur = quand on quitte le champ) ── */
  champs.forEach(champ => {

    /* Validation au départ du champ */
    champ.addEventListener('blur', () => validerChamp(champ));

    /* Effacer l'erreur quand l'utilisateur retape */
    champ.addEventListener('input', () => effacerErreur(champ));

  });


  /* ── Soumission du formulaire ── */
    /* ── Soumission du formulaire ── */
    formulaire.addEventListener('submit', (e) => {
        e.preventDefault();   /* Empêche le rechargement de la page */

        let formulaireValide = true;

        /* Valide tous les champs */
        champs.forEach(champ => {
            if (!validerChamp(champ)) {
                formulaireValide = false;
            }
        });

        /* Si tout est valide → ENVOI RÉEL À WEB3FORMS */
        if (formulaireValide) {
            // 1. On prépare le bouton pour montrer que ça charge
            const btn = formulaire.querySelector('button[type="submit"]');
            const texteOriginal = btn.innerHTML;
            btn.disabled = true;
            btn.innerHTML = "Envoi en cours...";

            // 2. On récupère les données du formulaire
            const formData = new FormData(formulaire);
            const object = Object.fromEntries(formData);
            const json = JSON.stringify(object);

            // 3. On envoie les données vers l'API Web3Forms
            fetch('https://api.web3forms.com/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: json
            })
                .then(async (response) => {
                    if (response.status == 200) {
                        // Si ça a marché, on affiche ton message de succès "MESSAGE ENVOYÉ !"
                        simulerEnvoi();
                        formulaire.reset(); // On vide le formulaire
                    } else {
                        alert("Erreur lors de l'envoi au serveur. Vérifiez votre clé.");
                    }
                })
                .catch(error => {
                    console.error(error);
                    alert("Un problème réseau est survenu.");
                })
                .finally(() => {
                    // On remet le bouton à son état normal à la fin
                    btn.disabled = false;
                    btn.innerHTML = texteOriginal;
                });

        } else {
            /* Faire défiler vers le premier champ en erreur */
            const premierErreur = formulaire.querySelector('.champ-erreur');
            if (premierErreur) {
                premierErreur.scrollIntoView({ behavior: 'smooth', block: 'center' });
                premierErreur.focus();
            }
        }
    });


  /* ── Valider un champ individuel ── */
  function validerChamp(champ) {
    const valeur = champ.value.trim();
    const nom    = champ.name || champ.getAttribute('name') || '';
    let valide   = true;
    let message  = '';

    /* Règle 1 : Champ obligatoire */
    if (champ.hasAttribute('required') && !valeur) {
      valide  = false;
      message = 'Ce champ est obligatoire.';
    }

    /* Règle 2 : Format email */
    else if ((nom === 'email' || champ.type === 'email') && valeur) {
      const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
      if (!regexEmail.test(valeur)) {
        valide  = false;
        message = 'Veuillez entrer une adresse email valide.';
      }
    }

    /* Règle 3 : Téléphone (optionnel mais format valide si rempli) */
    else if (nom === 'telephone' && valeur) {
      const regexTel = /^[\d\s\+\-\(\)\.]{7,20}$/;
      if (!regexTel.test(valeur)) {
        valide  = false;
        message = 'Numéro de téléphone invalide (ex: +1 581 688-3346).';
      }
    }

    /* Règle 4 : Message minimum 20 caractères */
    else if (nom === 'message' && valeur && valeur.length < 20) {
      valide  = false;
      message = 'Le message doit contenir au moins 20 caractères.';
    }

    /* Afficher ou effacer l'erreur */
    if (!valide) {
      afficherErreur(champ, message);
    } else {
      effacerErreur(champ);
    }

    return valide;
  }


  /* ── Afficher un message d'erreur sous le champ ── */
  function afficherErreur(champ, message) {
    champ.classList.add('champ-erreur');

    const msgEl = champ.parentElement.querySelector('.msg-erreur');
    if (msgEl) {
      msgEl.textContent = message;
      msgEl.classList.add('visible');
    }
  }


  /* ── Effacer un message d'erreur ── */
  function effacerErreur(champ) {
    champ.classList.remove('champ-erreur');

    const msgEl = champ.parentElement.querySelector('.msg-erreur');
    if (msgEl) {
      msgEl.classList.remove('visible');
    }
  }


  /* ── Simuler l'envoi (remplacer par une vraie API si nécessaire) ── */
    /* ── ENVOI RÉEL (Web3Forms) ── */
    function simulerEnvoi() {
        const btnEnvoyer = formulaire.querySelector('[type="submit"]');
        const texteOriginal = btnEnvoyer.innerHTML;

        /* État chargement visuel */
        btnEnvoyer.innerHTML = '⏳ Envoi en cours...';
        btnEnvoyer.disabled = true;
        btnEnvoyer.style.opacity = '0.72';

        /* Préparation des données pour l'envoi réel */
        const formData = new FormData(formulaire);
        const object = Object.fromEntries(formData);
        const json = JSON.stringify(object);

        /* Envoi vers l'API Web3Forms */
        fetch('https://api.web3forms.com/submit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: json
        })
            .then(async (response) => {
                if (response.status == 200) {
                    /* SUCCÈS : On affiche le message de confirmation sur le site */
                    formulaire.style.display = 'none';
                    const succes = document.querySelector('#form-succes');
                    if (succes) {
                        succes.classList.add('visible');
                    }
                    if (window.afficherToast) {
                        window.afficherToast('Message envoyé avec succès ! ✅');
                    }
                } else {
                    /* ERREUR SERVEUR */
                    alert("Erreur lors de l'envoi au serveur. Vérifiez votre clé d'accès.");
                    btnEnvoyer.disabled = false;
                    btnEnvoyer.innerHTML = texteOriginal;
                    btnEnvoyer.style.opacity = '1';
                }
            })
            .catch(error => {
                /* ERREUR RÉSEAU */
                console.error(error);
                alert("Un problème réseau est survenu. Réessayez plus tard.");
                btnEnvoyer.disabled = false;
                btnEnvoyer.innerHTML = texteOriginal;
                btnEnvoyer.style.opacity = '1';
            });
    }

}


/* ================================================================
   7. PARALLAXE LÉGER SUR LE HERO
      Le contenu du hero se déplace doucement lors du scroll,
      créant un effet de profondeur
   ================================================================ */

function initParallaxe() {

  const hero = document.querySelector('.hero');
  if (!hero) return;

  const contenu = hero.querySelector('.hero-contenu');
  if (!contenu) return;

  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;

    /* Uniquement dans les limites du hero (1 écran de hauteur) */
    if (scrollY < window.innerHeight) {
      /* Décalage vertical léger */
      contenu.style.transform = `translateY(${scrollY * 0.22}px)`;
      /* Fondu progressif */
      contenu.style.opacity   = String(1 - (scrollY / (window.innerHeight * 0.75)));
    }
  }, { passive: true });   /* passive:true pour de meilleures performances */

}


/* ================================================================
   8. LUEUR QUI SUIT LE CURSEUR (Desktop uniquement)
      Un halo doré semi-transparent suit la souris discrètement
   ================================================================ */

function initLueurCurseur() {

  /* Seulement sur les écrans avec pointeur précis (souris) */
  if (!window.matchMedia('(pointer: fine)').matches) return;

  const lueur = document.createElement('div');
  lueur.setAttribute('aria-hidden', 'true');

  lueur.style.cssText = `
    position:       fixed;
    width:          320px;
    height:         320px;
    border-radius:  50%;
    background:     radial-gradient(circle, rgba(245,197,24,0.055) 0%, transparent 70%);
    pointer-events: none;
    z-index:        0;
    transform:      translate(-50%, -50%);
    transition:     opacity 0.3s ease;
    will-change:    left, top;
  `;

  document.body.appendChild(lueur);

  document.addEventListener('mousemove', (e) => {
    lueur.style.left = e.clientX + 'px';
    lueur.style.top  = e.clientY + 'px';
  }, { passive: true });

  /* Masquer quand la souris quitte la fenêtre */
  document.addEventListener('mouseleave', () => { lueur.style.opacity = '0'; });
  document.addEventListener('mouseenter', () => { lueur.style.opacity = '1'; });

}


/* ================================================================
   9. TOAST NOTIFICATION — Utilitaire global
      Usage : window.afficherToast('Message', 'succes' | 'erreur')
   ================================================================ */

window.afficherToast = function(message, type = 'succes') {

  /* Couleur selon le type */
  const couleur = type === 'succes' ? '#F5C518' : '#E74C3C';

  const toast = document.createElement('div');
  toast.setAttribute('role', 'alert');
  toast.setAttribute('aria-live', 'polite');

  toast.style.cssText = `
    position:        fixed;
    bottom:          28px;
    right:           28px;
    background:      rgba(26, 10, 0, 0.96);
    border:          1px solid ${couleur};
    border-left:     4px solid ${couleur};
    color:           #fff;
    padding:         16px 22px;
    border-radius:   10px;
    font-family:     'Barlow Condensed', sans-serif;
    font-size:       0.92rem;
    letter-spacing:  0.04em;
    z-index:         9999;
    backdrop-filter: blur(12px);
    transform:       translateX(120%);
    transition:      transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    max-width:       340px;
    line-height:     1.5;
    box-shadow:      0 8px 32px rgba(0,0,0,0.5);
  `;

  toast.textContent = message;
  document.body.appendChild(toast);

  /* Animer l'entrée */
  requestAnimationFrame(() => {
    toast.style.transform = 'translateX(0)';
  });

  /* Supprimer après 4 secondes */
  setTimeout(() => {
    toast.style.transform = 'translateX(120%)';
    setTimeout(() => {
      if (toast.parentNode) toast.remove();
    }, 400);
  }, 4000);

};
