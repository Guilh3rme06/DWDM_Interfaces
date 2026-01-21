// Auto-tradução com LibreTranslate API
class AutoTranslator {
    constructor() {
        this.currentLanguage = localStorage.getItem('selectedLanguage') || 'pt';
        this.apiUrl = 'https://libretranslate.de/translate';
        this.cache = new Map();
        this.loadCacheFromStorage();
    }

    async start() {
        if (this.currentLanguage === 'pt') return;  // Português é padrão, sem tradução necessária

        console.log(`🌍 Traduzindo página para ${this.currentLanguage}...`);
        
        // Obtém todos os nós de texto
        const textNodes = this.getAllTextNodes(document.body);
        
        // Agrupa por chunks para não sobrecarregar
        const chunks = [];
        let currentChunk = [];
        
        for (const node of textNodes) {
            const text = node.textContent.trim();
            if (text.length > 2 && !this.isCode(node)) {
                currentChunk.push({ node, text });
                
                if (currentChunk.length >= 5) {
                    chunks.push([...currentChunk]);
                    currentChunk = [];
                }
            }
        }
        
        if (currentChunk.length > 0) {
            chunks.push(currentChunk);
        }

        // Traduz cada chunk com delay para não sobrecarregar a API
        for (const chunk of chunks) {
            await this.translateChunk(chunk);
            await this.sleep(500);  // Delay entre chunks
        }
        
        console.log('✅ Tradução completa!');
    }

    async translateChunk(chunk) {
        const promises = chunk.map(item => 
            this.translateNode(item.node, item.text)
        );
        
        await Promise.allSettled(promises);
    }

    async translateNode(node, text) {
        // Verifica cache
        const cacheKey = `${text}:${this.currentLanguage}`;
        
        if (this.cache.has(cacheKey)) {
            node.textContent = this.cache.get(cacheKey);
            return;
        }

        try {
            const response = await fetch(this.apiUrl, {
                method: 'POST',
                body: JSON.stringify({
                    q: text,
                    source: 'pt',
                    target: this.currentLanguage
                }),
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                const translated = data.translatedText;
                
                // Armazena no cache
                this.cache.set(cacheKey, translated);
                localStorage.setItem(`trans_${cacheKey}`, translated);
                
                // Atualiza o nó
                node.textContent = translated;
            }
        } catch (error) {
            console.log('⚠️ Erro ao traduzir:', error.message);
        }
    }

    getAllTextNodes(element) {
        const textNodes = [];
        const walker = document.createTreeWalker(
            element,
            NodeFilter.SHOW_TEXT,
            null,
            false
        );

        let node;
        while (node = walker.nextNode()) {
            if (node.textContent.trim().length > 0) {
                textNodes.push(node);
            }
        }
        return textNodes;
    }

    isCode(node) {
        // Evita traduzir conteúdo em <code>, <script>, etc.
        let parent = node.parentElement;
        while (parent) {
            if (['CODE', 'SCRIPT', 'STYLE', 'BUTTON', 'INPUT'].includes(parent.tagName)) {
                return true;
            }
            parent = parent.parentElement;
        }
        return false;
    }

    loadCacheFromStorage() {
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith('trans_')) {
                const cacheKey = key.replace('trans_', '');
                const value = localStorage.getItem(key);
                this.cache.set(cacheKey, value);
            }
        }
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Inicia auto-tradução quando a página carrega
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        const autoTranslator = new AutoTranslator();
        autoTranslator.start();
    });
} else {
    const autoTranslator = new AutoTranslator();
    autoTranslator.start();
}
