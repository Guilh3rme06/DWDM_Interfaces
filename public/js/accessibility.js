// Modo Noturno
const modoNoturnoBtn = document.querySelector('.modo-noturno');
const body = document.body;

// Verificar se há preferência salva para modo noturno
if (localStorage.getItem('modoNoturno') === 'ativo') {
    body.classList.add('modo-noturno-ativo');
    modoNoturnoBtn.innerHTML = '☀️ Modo Claro';
}

modoNoturnoBtn.addEventListener('click', () => {
    body.classList.toggle('modo-noturno-ativo');
    
    if (body.classList.contains('modo-noturno-ativo')) {
        modoNoturnoBtn.innerHTML = '☀️ Modo Claro';
        localStorage.setItem('modoNoturno', 'ativo');
    } else {
        modoNoturnoBtn.innerHTML = '🌙 Modo Noturno';
        localStorage.removeItem('modoNoturno');
    }
});

// Tamanho da Fonte
let fontSize = parseInt(localStorage.getItem('fontSize')) || 100;

// Restaurar tamanho da fonte ao carregar a página
if (fontSize !== 100) {
    document.documentElement.style.fontSize = fontSize + '%';
}

const btnFontPlus = document.querySelector('.btn-font-plus');
const btnFontMinus = document.querySelector('.btn-font-minus');

// Aumentar Fonte
if (btnFontPlus) {
    btnFontPlus.addEventListener('click', () => {
        if (fontSize < 130) {
            fontSize += 10;
            document.documentElement.style.fontSize = fontSize + '%';
            localStorage.setItem('fontSize', fontSize);
        }
    });
}

// Diminuir Fonte
if (btnFontMinus) {
    btnFontMinus.addEventListener('click', () => {
        if (fontSize > 80) {
            fontSize -= 10;
            document.documentElement.style.fontSize = fontSize + '%';
            localStorage.setItem('fontSize', fontSize);
        }
    });
}

// Modo Dislexia (OpenDyslexic)
const btnDyslexic = document.querySelector('.btn-dyslexic');

// Verificar se há preferência salva para modo dislexia
if (localStorage.getItem('dyslexicMode') === 'ativo') {
    body.classList.add('dyslexic-mode');
    if (btnDyslexic) {
        btnDyslexic.classList.add('active');
    }
}

if (btnDyslexic) {
    btnDyslexic.addEventListener('click', () => {
        body.classList.toggle('dyslexic-mode');
        
        if (body.classList.contains('dyslexic-mode')) {
            btnDyslexic.classList.add('active');
            localStorage.setItem('dyslexicMode', 'ativo');
        } else {
            btnDyslexic.classList.remove('active');
            localStorage.removeItem('dyslexicMode');
        }
    });
}

// Menu Hambúrguer - Telemóvel
const hamburgerBtn = document.querySelector('.hamburger-btn');
const mainNav = document.querySelector('.main-nav');

if (hamburgerBtn && mainNav) {
    hamburgerBtn.addEventListener('click', () => {
        mainNav.classList.toggle('active');
        hamburgerBtn.classList.toggle('active');
        hamburgerBtn.setAttribute('aria-expanded', 
            hamburgerBtn.getAttribute('aria-expanded') === 'false' ? 'true' : 'false'
        );
    });

    // Fechar menu ao clicar num link
    const navLinks = mainNav.querySelectorAll('a');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            mainNav.classList.remove('active');
            hamburgerBtn.classList.remove('active');
            hamburgerBtn.setAttribute('aria-expanded', 'false');
        });
    });

    // Fechar menu ao clicar fora
    document.addEventListener('click', (e) => {
        if (!hamburgerBtn.contains(e.target) && !mainNav.contains(e.target)) {
            mainNav.classList.remove('active');
            hamburgerBtn.classList.remove('active');
            hamburgerBtn.setAttribute('aria-expanded', 'false');
        }
    });
}

// Atualizar todos os botões de modo noturno quando mudar
document.addEventListener('DOMContentLoaded', () => {
    const allModoNorturnoButtons = document.querySelectorAll('.modo-noturno');
    allModoNorturnoButtons.forEach(btn => {
        if (btn !== modoNoturnoBtn && modoNoturnoBtn) {
            btn.innerHTML = modoNoturnoBtn.innerHTML;
            btn.addEventListener('click', () => {
                modoNoturnoBtn.click();
                allModoNorturnoButtons.forEach(b => {
                    b.innerHTML = modoNoturnoBtn.innerHTML;
                });
            });
        }
    });
});

// Text-to-Speech (Áudio Fluido)
class AudioReader {
    constructor() {
        this.audioBtn = document.querySelector('#audioBtn');
        this.isSpeaking = false;
        this.isPaused = false;
        this.synth = window.speechSynthesis;
        this.utterances = [];
        this.currentUtteranceIndex = 0;
        
        if (this.audioBtn) {
            this.audioBtn.addEventListener('click', () => this.toggleAudio());
        }
    }

    extractTextContent() {
        const mainContent = document.querySelector('main');
        if (!mainContent) return '';
        
        const clone = mainContent.cloneNode(true);
        
        // Remover elementos que não devem ser lidos
        const elementsToRemove = clone.querySelectorAll('script, style, .skip-link, button, a[download]');
        elementsToRemove.forEach(el => el.remove());
        
        return clone.innerText;
    }

    // Segmentar texto em frases para leitura mais fluida
    segmentText(text) {
        // Dividir em frases usando pontuação
        const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
        return sentences.map(s => s.trim()).filter(s => s.length > 0);
    }

    getCurrentLanguage() {
        return localStorage.getItem('selectedLanguage') || 'pt';
    }

    getLanguageCode() {
        const langMap = {
            'pt': 'pt-PT',
            'en': 'en-US',
            'es': 'es-ES',
            'fr': 'fr-FR'
        };
        return langMap[this.getCurrentLanguage()] || 'pt-PT';
    }

    createUtterances(text) {
        const sentences = this.segmentText(text);
        this.utterances = [];

        sentences.forEach((sentence, index) => {
            const utterance = new SpeechSynthesisUtterance(sentence);
            utterance.lang = this.getLanguageCode();
            utterance.rate = 0.95; // Velocidade um pouco mais lenta para clareza
            utterance.pitch = 1;
            utterance.volume = 1;

            // Event handlers
            utterance.onstart = () => {
                if (index === 0) {
                    this.isSpeaking = true;
                    this.updateButtonState();
                }
            };

            utterance.onend = () => {
                this.currentUtteranceIndex = index;
                
                // Se foi a última frase, termina
                if (index === sentences.length - 1) {
                    this.isSpeaking = false;
                    this.isPaused = false;
                    this.currentUtteranceIndex = 0;
                    this.updateButtonState();
                }
            };

            utterance.onerror = (event) => {
                console.error('Erro ao ler:', event.error);
                this.stopAudio();
            };

            this.utterances.push(utterance);
        });
    }

    toggleAudio() {
        if (!this.isSpeaking && !this.isPaused) {
            // Iniciar leitura
            this.startAudio();
        } else if (this.isSpeaking) {
            // Pausar
            this.pauseAudio();
        } else if (this.isPaused) {
            // Retomar
            this.resumeAudio();
        }
    }

    startAudio() {
        const textContent = this.extractTextContent();
        if (!textContent.trim()) {
            alert('Nenhum conteúdo para ler');
            return;
        }

        // Parar qualquer fala anterior
        this.synth.cancel();

        this.createUtterances(textContent);
        this.isSpeaking = true;
        this.isPaused = false;
        this.currentUtteranceIndex = 0;

        this.updateButtonState();

        // Falar todos os utterances
        this.utterances.forEach(utterance => {
            this.synth.speak(utterance);
        });
    }

    pauseAudio() {
        if (this.synth.speaking && !this.isPaused) {
            // Navegador suporta pausa
            if (this.synth.pause) {
                this.synth.pause();
            }
            this.isSpeaking = false;
            this.isPaused = true;
            this.updateButtonState();
        }
    }

    resumeAudio() {
        if (this.isPaused) {
            if (this.synth.resume) {
                this.synth.resume();
            }
            this.isSpeaking = true;
            this.isPaused = false;
            this.updateButtonState();
        }
    }

    stopAudio() {
        this.synth.cancel();
        this.isSpeaking = false;
        this.isPaused = false;
        this.currentUtteranceIndex = 0;
        this.utterances = [];
        this.updateButtonState();
    }

    updateButtonState() {
        if (!this.audioBtn) return;

        if (this.isSpeaking || this.isPaused) {
            this.audioBtn.classList.add('playing');
            if (this.isPaused) {
                this.audioBtn.innerHTML = '<span>▶️</span> <span>Retomar Áudio</span>';
            } else {
                this.audioBtn.innerHTML = '<span>⏸️</span> <span>Pausar Áudio</span>';
            }
        } else {
            this.audioBtn.classList.remove('playing');
            this.audioBtn.innerHTML = '<span>🔊</span> <span data-i18n="btnAudio">Ler em Áudio</span>';
        }
    }
}

// Inicializar o leitor de áudio quando o DOM carregar
document.addEventListener('DOMContentLoaded', () => {
    new AudioReader();
});
