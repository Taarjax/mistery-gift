// Configuration des données
const CONFIG = {
    startDate: '2025-08-06', // Date de début (anniversaire) - 6 août 2025
    endDate: '2025-08-09',   // Date de fin - 9 août 2025
    totalDays: 4,
    messages: {
        1: "",
        2: "💝 Plus que quelques jours pour tes cadeaux !",
        3: "✨ Téma les abdos du fréro ! ",
        4: "🎉 Dernier jour de cette aventure, mais pas la fin de nos aventures... tutututu MAX VERSTAPEN"
    }
};

// État de l'application
let currentDay = 1;

// Vérifier s'il y a une simulation en cours (uniquement pour les tests)
let today = new Date();
const simulatedDate = localStorage.getItem('simulatedDate');
if (simulatedDate) {
    today = new Date(simulatedDate);
    console.log('🔧 Mode simulation activé:', simulatedDate);
}

let startDate = new Date(CONFIG.startDate);
let endDate = new Date(CONFIG.endDate);

// Éléments DOM
const elements = {
    days: document.getElementById('days'),
    hours: document.getElementById('hours'),
    minutes: document.getElementById('minutes'),
    seconds: document.getElementById('seconds'),
    prevBtn: document.getElementById('prevBtn'),
    nextBtn: document.getElementById('nextBtn'),
    dayNumber: document.getElementById('dayNumber'),
    currentDay: document.getElementById('currentDay'),
    dailyImage: document.getElementById('dailyImage'),
    dailyMessage: document.getElementById('dailyMessage'),
    progressFill: document.getElementById('progressFill'),
    progressText: document.getElementById('progressText'),
    confettiContainer: document.getElementById('confetti-container')
};

// Image placeholder SVG (évite les requêtes infinies)
const placeholderSVG = `data:image/svg+xml;base64,${btoa(`
<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#FFB6C1;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#DDA0DD;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="400" height="300" fill="url(#grad1)"/>
  <text x="200" y="150" font-family="Arial, sans-serif" font-size="24" fill="white" text-anchor="middle">
    Image du jour ${currentDay}
  </text>
  <text x="200" y="180" font-family="Arial, sans-serif" font-size="16" fill="white" text-anchor="middle">
    Ajoutez votre image day${currentDay}.jpg
  </text>
</svg>
`)}`;

// Initialisation
document.addEventListener('DOMContentLoaded', function() {
    // Forcer la réinitialisation si on vient d'un test
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('test') !== null) {
        // Effacer le cache et forcer le rechargement des variables
        today = new Date();
        const simulatedDate = localStorage.getItem('simulatedDate');
        if (simulatedDate) {
            today = new Date(simulatedDate);
            // Mode simulation activé
        }
        startDate = new Date(CONFIG.startDate);
        endDate = new Date(CONFIG.endDate);
    } else {
        // Si on ouvre le site normalement (pas depuis test-local.html), nettoyer les données de test
        if (localStorage.getItem('simulatedDate')) {
            localStorage.removeItem('simulatedDate');
            // Réinitialiser les variables
            today = new Date();
            startDate = new Date(CONFIG.startDate);
            endDate = new Date(CONFIG.endDate);
        }
    }
    
    initializeApp();
    startCountdown();
    updateDisplay();
    
    // Événements de navigation
    elements.prevBtn.addEventListener('click', goToPreviousDay);
    elements.nextBtn.addEventListener('click', goToNextDay);
});

// Initialisation de l'application
function initializeApp() {
    const now = today; // Utiliser la variable today qui peut être simulée
    const isInPeriod = now >= startDate && now <= endDate;
    
    if (!isInPeriod) {
        if (now < startDate) {
            // Avant la période - afficher le décompte mais pas le contenu principal
            showWaitingMessage();
            // Le décompte continuera de fonctionner
        } else {
            // Après la période
            showEndMessage();
        }
        return;
    }
    
    // Calculer le jour actuel basé sur la date réelle
    const daysSinceStart = Math.floor((now - startDate) / (1000 * 60 * 60 * 24));
    currentDay = Math.min(daysSinceStart + 1, CONFIG.totalDays);
    
    // Debug pour comprendre le calcul (retiré pour la production)
    
    // Vérifier si c'est le jour de l'anniversaire (06/08)
    const isBirthday = now.toDateString() === startDate.toDateString();
    if (isBirthday) {
        triggerBirthdayMode();
    }
}

// Compte à rebours
function startCountdown() {
    function updateCountdown() {
        let now;
        const simulatedDate = localStorage.getItem('simulatedDate');
        if (simulatedDate) {
            // Si on est en mode simulation, utiliser la date simulée MAIS garder l'heure réelle pour le décompte
            const simDate = new Date(simulatedDate);
            const realNow = new Date();
            // Prendre la date simulée mais l'heure actuelle
            now = new Date(simDate.getFullYear(), simDate.getMonth(), simDate.getDate(), 
                          realNow.getHours(), realNow.getMinutes(), realNow.getSeconds(), realNow.getMilliseconds());
        } else {
            // Sinon utiliser la vraie date/heure
            now = new Date();
        }
        
        let timeLeft;
        let countdownTarget;
        
        if (now < startDate) {
            // Avant le 6 août : compter vers le début (startDate)
            timeLeft = startDate - now;
            countdownTarget = "début";
        } else if (now <= endDate) {
            // Entre le 6 et le 9 août : compter vers la fin (endDate)
            timeLeft = endDate - now;
            countdownTarget = "fin";
        } else {
            // Après le 9 août : arrêter le compteur
            elements.days.textContent = '00';
            elements.hours.textContent = '00';
            elements.minutes.textContent = '00';
            elements.seconds.textContent = '00';
            return;
        }
        
        if (timeLeft <= 0) {
            elements.days.textContent = '00';
            elements.hours.textContent = '00';
            elements.minutes.textContent = '00';
            elements.seconds.textContent = '00';
            return;
        }
        
        const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
        
        elements.days.textContent = days.toString().padStart(2, '0');
        elements.hours.textContent = hours.toString().padStart(2, '0');
        elements.minutes.textContent = minutes.toString().padStart(2, '0');
        elements.seconds.textContent = seconds.toString().padStart(2, '0');
    }
    
    // Première mise à jour immédiate
    updateCountdown();
    
    // Toujours continuer le décompte en temps réel (même en mode simulation)
    setInterval(updateCountdown, 1000);
}

// Navigation
function goToPreviousDay() {
    if (currentDay > 1) {
        currentDay--;
        animateTransition('left');
    }
}

function goToNextDay() {
    const now = today;
    const daysSinceStart = Math.floor((now - startDate) / (1000 * 60 * 60 * 24));
    const maxAllowedDay = Math.min(daysSinceStart + 1, CONFIG.totalDays);
    
    if (currentDay < maxAllowedDay) {
        currentDay++;
        animateTransition('right');
    }
}

// Mise à jour de l'affichage
function updateDisplay() {
    // Mettre à jour le numéro du jour
    elements.dayNumber.textContent = currentDay;
    
    // Mettre à jour l'image avec gestion d'erreur améliorée
    const imagePath = `images/day${currentDay}.jpg`;
    elements.dailyImage.src = imagePath;
    
    // Gestion d'erreur d'image avec SVG placeholder
    elements.dailyImage.onerror = function() {
        // Créer un SVG placeholder dynamique sans emojis
        const svgContent = `
<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#FFB6C1;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#DDA0DD;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="400" height="300" fill="url(#grad1)"/>
  <text x="200" y="150" font-family="Arial, sans-serif" font-size="24" fill="white" text-anchor="middle">
    Image du jour ${currentDay}
  </text>
  <text x="200" y="180" font-family="Arial, sans-serif" font-size="16" fill="white" text-anchor="middle">
    Ajoutez votre image day${currentDay}.jpg
  </text>
</svg>`;
        
        this.src = `data:image/svg+xml;base64,${btoa(svgContent)}`;
        // Empêcher les nouvelles tentatives de chargement
        this.onerror = null;
    };
    
    // Mettre à jour le message
    elements.dailyMessage.textContent = CONFIG.messages[currentDay] || "Message du jour...";
    
    // Mettre à jour la navigation
    updateNavigation();
    
    // Mettre à jour la progression
    updateProgress();
    
    // Vérifier si c'est le jour de l'anniversaire
    const now = today;
    const isBirthday = now.toDateString() === startDate.toDateString() && currentDay === 1;
    if (isBirthday) {
        elements.dailyMessage.classList.add('birthday-mode');
    } else {
        elements.dailyMessage.classList.remove('birthday-mode');
    }
}

// Mise à jour de la navigation
function updateNavigation() {
    const now = today;
    const daysSinceStart = Math.floor((now - startDate) / (1000 * 60 * 60 * 24));
    const maxAllowedDay = Math.min(daysSinceStart + 1, CONFIG.totalDays);
    
    // Bouton précédent
    elements.prevBtn.disabled = currentDay <= 1;
    
    // Bouton suivant
    elements.nextBtn.disabled = currentDay >= maxAllowedDay;
}

// Mise à jour de la progression
function updateProgress() {
    const progress = (currentDay / CONFIG.totalDays) * 100;
    elements.progressFill.style.width = `${progress}%`;
    elements.progressText.textContent = `Jour ${currentDay} sur ${CONFIG.totalDays}`;
}

// Animations de transition modernes
function animateTransition(direction) {
    const imageContainer = elements.dailyImage.parentElement;
    const messageContainer = elements.dailyMessage.parentElement;
    
    // Déterminer les classes d'animation selon la direction
    const slideOutClass = direction === 'left' ? 'slide-out-right' : 'slide-out-left';
    const slideInClass = direction === 'left' ? 'slide-in-left' : 'slide-in-right';
    
    // Animation de sortie
    imageContainer.classList.add(slideOutClass);
    messageContainer.classList.add('fade-out');
    
    setTimeout(() => {
        // Nettoyer les classes de sortie
        imageContainer.classList.remove(slideOutClass);
        messageContainer.classList.remove('fade-out');
        
        // Mettre à jour le contenu
        updateDisplay();
        
        // Animation d'entrée
        imageContainer.classList.add(slideInClass);
        messageContainer.classList.add('fade-in');
        
        // Nettoyer les classes d'entrée après l'animation
        setTimeout(() => {
            imageContainer.classList.remove(slideInClass);
            messageContainer.classList.remove('fade-in');
        }, 600);
        
    }, 300);
}

// Mode anniversaire avec confettis
function triggerBirthdayMode() {
    // Ajouter la classe spéciale
    document.body.classList.add('birthday-mode');
    
    // Lancer les confettis
    launchConfetti();
    
    // Animation spéciale pour le titre
    const title = document.querySelector('.title');
    title.style.animation = 'birthdayGlow 1s ease-in-out infinite alternate';
    
    // Message spécial
    setTimeout(() => {
        elements.dailyMessage.innerHTML = `
            <span style="font-size: 2rem;">🎂</span><br>
            <strong>JOYEUX ANNIVERSAIRE MA CHÉRIE !</strong><br><br>
			De la part de moi et notre ami Renaud (Oui l'IA c'est pas foufou on a aussi changé de physique)
            Que cette journée soit remplie de bonheur, d'amour et les prochaines de surprises... 
            Je t'aimes plus que tout ! 💕

			Patience, samedi tu auras ton cadeau !
        `;
    }, 100);
}

// Lancement des confettis
function launchConfetti() {
    const colors = ['#FFB6C1', '#DDA0DD', '#B0E0E6', '#F0E68C', '#FF69B4'];
    
    confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: colors
    });
    
    // Relancer les confettis toutes les 3 secondes
    setInterval(() => {
        confetti({
            particleCount: 50,
            spread: 70,
            origin: { y: 0.6 },
            colors: colors
        });
    }, 3000);
}

// Messages d'attente et de fin
function showWaitingMessage() {
    // Masquer la navigation et le contenu principal, mais garder le décompte
    const mainContent = document.querySelector('.main-content');
    const dayNavigation = document.querySelector('.day-navigation');
    const progressContainer = document.querySelector('.progress-container');
    
    if (mainContent) {
        mainContent.innerHTML = `
            <div class="waiting-message" style="text-align: center; padding: 50px 20px;">
                <h2 style="color: var(--secondary-purple); margin-bottom: 20px;">⏰ Patience...</h2>
                <p style="font-size: 1.2rem; color: var(--text-dark);">
                    Les devinettes commencent le 6 août 2025 ! 
                    <br>TIC TAC... TIC TAC... TIC TAC...
                </p>
            </div>
        `;
    }
    
    // Masquer la navigation et la progression
    if (dayNavigation) dayNavigation.style.display = 'none';
    if (progressContainer) progressContainer.style.display = 'none';
}

// Nouveau message pendant la période active
function showActiveMessage() {
    // Masquer la navigation et le contenu principal, mais garder le décompte
    const mainContent = document.querySelector('.main-content');
    const dayNavigation = document.querySelector('.day-navigation');
    const progressContainer = document.querySelector('.progress-container');
    
    if (mainContent) {
        mainContent.innerHTML = `
            <div class="active-message" style="text-align: center; padding: 50px 20px;">
                <h2 style="color: var(--secondary-purple); margin-bottom: 20px;">🎉 C'est parti !</h2>
                <p style="font-size: 1.2rem; color: var(--text-dark);">
                    La semaine magique est en cours ! 
                    <br>Plus que quelques jours jusqu'au 9 août...
                </p>
            </div>
        `;
    }
    
    // Masquer la navigation et la progression
    if (dayNavigation) dayNavigation.style.display = 'none';
    if (progressContainer) progressContainer.style.display = 'none';
}

function showEndMessage() {
    document.querySelector('.main-content').innerHTML = `
        <div class="end-message" style="text-align: center; padding: 50px 20px;">
            <h2 style="color: var(--secondary-purple); margin-bottom: 20px;">🎉 Merci !</h2>
            <p style="font-size: 1.2rem; color: var(--text-dark);">
                Cette semaine magique est terminée, 
                <br>mais notre aventure continue ! 💕
            </p>
        </div>
    `;
} 