/* ================================================================
   PUBLICUS GROUP — script.js
   Script principal partagé par les 4 pages du site.
   ----------------------------------------------------------------
   TABLE DES MATIÈRES :
   1. Navigation (navbar scroll + burger menu)
   2. Animations scroll (Intersection Observer)
   3. Compteur de statistiques animé
   4. Formulaire de contact (Web3Forms + validation)
   ================================================================ */

(function () {
  'use strict';

  /* ================================================================
     1. NAVIGATION
        - Classe "scrolled" sur la navbar au défilement
        - Burger menu (ouverture / fermeture / accessibilité)
     ================================================================ */

  var navbar     = document.querySelector('.navbar');
  var burger     = document.querySelector('.burger');
  var menuMobile = document.getElementById('menu-mobile');

  /* Ajoute la classe .scrolled dès que l'utilisateur fait défiler */
  function gererScroll() {
    if (!navbar) return;
    if (window.scrollY > 20) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', gererScroll, { passive: true });
  gererScroll(); /* Appel immédiat au chargement */

  /* Burger : toggle du menu mobile */
  if (burger && menuMobile) {
    burger.addEventListener('click', function () {
      var estOuvert = menuMobile.classList.toggle('ouvert');
      burger.setAttribute('aria-expanded', estOuvert ? 'true' : 'false');
    });

    /* Ferme le menu si on clique sur un lien */
    menuMobile.querySelectorAll('a').forEach(function (lien) {
      lien.addEventListener('click', function () {
        menuMobile.classList.remove('ouvert');
        burger.setAttribute('aria-expanded', 'false');
      });
    });

    /* Ferme le menu avec la touche Échap */
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menuMobile.classList.contains('ouvert')) {
        menuMobile.classList.remove('ouvert');
        burger.setAttribute('aria-expanded', 'false');
        burger.focus();
      }
    });
  }


  /* ================================================================
     2. ANIMATIONS SCROLL (Intersection Observer)
        Ajoute la classe .visible sur les éléments .revele, 
        .revele-gauche et .revele-droite quand ils entrent dans le
        viewport. Déclenche en cascade grâce aux classes .delai-N.
     ================================================================ */

  var selecteurRevele = '.revele, .revele-gauche, .revele-droite';
  var elementsRevele  = document.querySelectorAll(selecteurRevele);

  if (elementsRevele.length > 0 && 'IntersectionObserver' in window) {
    var observateurScroll = new IntersectionObserver(
      function (entrees) {
        entrees.forEach(function (entree) {
          if (entree.isIntersecting) {
            entree.target.classList.add('visible');
            observateurScroll.unobserve(entree.target); /* N'observe qu'une seule fois */
          }
        });
      },
      {
        threshold:  0.12,   /* Déclenche quand 12% de l'élément est visible */
        rootMargin: '0px 0px -40px 0px' /* Légère marge basse pour plus de fluidité */
      }
    );

    elementsRevele.forEach(function (el) {
      observateurScroll.observe(el);
    });
  } else {
    /* Fallback : rend tout visible immédiatement si IntersectionObserver non supporté */
    elementsRevele.forEach(function (el) {
      el.classList.add('visible');
    });
  }


  /* ================================================================
     3. COMPTEUR DE STATISTIQUES
        Anime les chiffres dans .stat-chiffre de 0 jusqu'à data-cible.
        Utilise requestAnimationFrame pour des performances optimales.
     ================================================================ */

  var statsElements = document.querySelectorAll('.stat-chiffre');

  if (statsElements.length > 0 && 'IntersectionObserver' in window) {
    var observateurStats = new IntersectionObserver(
      function (entrees) {
        entrees.forEach(function (entree) {
          if (entree.isIntersecting) {
            animerCompteur(entree.target);
            observateurStats.unobserve(entree.target);
          }
        });
      },
      { threshold: 0.5 }
    );

    statsElements.forEach(function (el) {
      observateurStats.observe(el);
    });
  }

  function animerCompteur(element) {
    var cible    = parseInt(element.getAttribute('data-cible'), 10) || 0;
    var suffixe  = element.getAttribute('data-suffixe') || '';
    var duree    = 1800; /* Durée totale en ms */
    var debut    = null;
    var valeurInitiale = 0;

    function etape(horodatage) {
      if (!debut) debut = horodatage;
      var progres  = Math.min((horodatage - debut) / duree, 1);
      /* Easing ease-out cubic */
      var eased    = 1 - Math.pow(1 - progres, 3);
      var valeur   = Math.floor(eased * (cible - valeurInitiale) + valeurInitiale);
      element.textContent = valeur + suffixe;
      if (progres < 1) {
        requestAnimationFrame(etape);
      } else {
        element.textContent = cible + suffixe;
      }
    }

    requestAnimationFrame(etape);
  }


  /* ================================================================
     4. FORMULAIRE DE CONTACT (Web3Forms)
        - Validation HTML5 + JS personnalisée
        - Envoi via fetch vers l'API Web3Forms
        - États : chargement / succès / erreur
     ================================================================ */

  var form             = document.getElementById('contact-form');
  var successMessage   = document.getElementById('success-message');
  var errorNotif       = document.getElementById('error-notification');
  var errorText        = document.getElementById('error-text');
  var submitBtn        = document.getElementById('submit-btn');
  var btnLabel         = document.getElementById('btn-label');
  var btnSpinner       = document.getElementById('btn-spinner');

  /* Quitte proprement si le formulaire n'est pas sur cette page */
  if (!form) return;

  /* ── Validation individuelle d'un champ ── */
  function validerChamp(input) {
    var groupe = input.closest('.champ-groupe');
    if (!groupe) return true;

    var msgErreur = groupe.querySelector('.msg-erreur');
    var valide    = true;

    if (input.tagName === 'SELECT') {
      valide = !input.required || input.value !== '';
    } else if (input.type === 'email') {
      var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      valide = emailRegex.test(input.value.trim());
    } else if (input.required) {
      valide = input.value.trim() !== '';
    }

    input.classList.toggle('champ-erreur', !valide);
    if (msgErreur) {
      msgErreur.classList.toggle('visible', !valide);
    }

    return valide;
  }

  /* ── Validation en temps réel (après premier échec) ── */
  form.querySelectorAll('.champ-input, .champ-textarea, .champ-select').forEach(function (el) {
    el.addEventListener('blur', function () {
      validerChamp(el);
    });
    el.addEventListener('input', function () {
      if (el.classList.contains('champ-erreur')) {
        validerChamp(el);
      }
    });
    el.addEventListener('change', function () {
      if (el.classList.contains('champ-erreur')) {
        validerChamp(el);
      }
    });
  });

  /* ── État du bouton : chargement ── */
  function setBtnChargement(actif) {
    submitBtn.disabled = actif;
    if (btnSpinner) btnSpinner.style.display = actif ? 'block' : 'none';
    if (btnLabel)   btnLabel.textContent     = actif ? 'Envoi en cours…' : 'Envoyer ma demande →';
  }

  /* ── Afficher l'erreur ── */
  function afficherErreur(message) {
    if (errorText)  errorText.textContent = message ||
      'Une erreur est survenue. Veuillez réessayer ou écrire à publicusgroup2026@gmail.com.';
    if (errorNotif) {
      errorNotif.classList.remove('visible');
      /* Force un reflow pour relancer l'animation CSS */
      void errorNotif.offsetWidth;
      errorNotif.classList.add('visible');
    }
  }

  /* ── Afficher le succès ── */
  function afficherSucces() {
    form.style.display = 'none';

    if (successMessage) {
      /* Rend l'élément flex d'abord, puis anime via rAF */
      successMessage.style.display = 'flex';
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          successMessage.classList.add('visible');
          successMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
        });
      });
    }
  }

  /* ── Soumission du formulaire ── */
  form.addEventListener('submit', function (e) {
    e.preventDefault();

    /* Masque l'éventuelle erreur précédente */
    if (errorNotif) errorNotif.classList.remove('visible');

    /* Valide tous les champs requis */
    var champsRequis = form.querySelectorAll('[required]');
    var toutValide   = true;

    champsRequis.forEach(function (champ) {
      if (!validerChamp(champ)) {
        toutValide = false;
      }
    });

    if (!toutValide) {
      /* Fait défiler jusqu'au premier champ en erreur */
      var premierErreur = form.querySelector('.champ-erreur');
      if (premierErreur) {
        premierErreur.scrollIntoView({ behavior: 'smooth', block: 'center' });
        premierErreur.focus();
      }
      return;
    }

    /* Lance l'état de chargement */
    setBtnChargement(true);

    /* Prépare les données pour Web3Forms */
    var donneesFormulaire = new FormData(form);
    var objetDonnees      = Object.fromEntries(donneesFormulaire);

    /* Envoi vers l'API Web3Forms */
    fetch('https://api.web3forms.com/submit', {
      method:  'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept':       'application/json'
      },
      body: JSON.stringify(objetDonnees)
    })
    .then(function (reponse) {
      return reponse.json().then(function (data) {
        return { status: reponse.status, ok: reponse.ok, data: data };
      });
    })
    .then(function (resultat) {
      setBtnChargement(false);
      if (resultat.ok && resultat.data.success) {
        afficherSucces();
      } else {
        var messageErreur = (resultat.data && resultat.data.message)
          ? resultat.data.message
          : 'Une erreur est survenue (code ' + resultat.status + '). Veuillez réessayer.';
        afficherErreur(messageErreur);
      }
    })
    .catch(function (erreur) {
      setBtnChargement(false);
      afficherErreur(
        'Impossible de contacter le serveur. Vérifiez votre connexion ou écrivez directement à publicusgroup2026@gmail.com.'
      );
      console.error('[Publicus Group] Erreur formulaire :', erreur);
    });
  });

})(); /* Fin IIFE */
