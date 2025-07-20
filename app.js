/**
 * Aplicação principal para identificação de bandeiras de cartão de crédito
 * Integra a interface HTML com a lógica de validação
 */

// Instância do validador de cartões
const cardValidator = new CardValidator();

// Elementos DOM
const cardNumberInput = document.getElementById('cardNumber');
const cardBrandDisplay = document.getElementById('cardBrand');
const validationInfo = document.getElementById('validationInfo');
const testButtons = document.querySelectorAll('.test-btn');

/**
 * Atualiza a exibição da bandeira identificada
 * @param {object} validationResult - Resultado da validação do cartão
 */
function updateCardBrandDisplay(validationResult) {
    const { brand, isLuhnValid, isLengthValid, isCompletelyValid, formattedNumber } = validationResult;
    
    if (!brand) {
        cardBrandDisplay.innerHTML = '<span class="brand-text">Bandeira não identificada</span>';
        cardBrandDisplay.className = 'card-brand unknown';
        updateValidationInfo(null, false, false, false);
        return;
    }

    // Atualiza o display da bandeira
    cardBrandDisplay.innerHTML = `
        <div class="brand-info">
            <span class="brand-icon">${brand.icon}</span>
            <span class="brand-name">${brand.name}</span>
            ${isCompletelyValid ? '<span class="valid-indicator">✅</span>' : ''}
        </div>
    `;
    
    cardBrandDisplay.className = `card-brand ${brand.type}`;
    cardBrandDisplay.style.borderColor = brand.color;
    
    // Atualiza informações de validação
    updateValidationInfo(brand, isLuhnValid, isLengthValid, isCompletelyValid);
}

/**
 * Atualiza as informações de validação
 * @param {object} brand - Informações da bandeira
 * @param {boolean} isLuhnValid - Se passou na validação Luhn
 * @param {boolean} isLengthValid - Se tem comprimento válido
 * @param {boolean} isCompletelyValid - Se é completamente válido
 */
function updateValidationInfo(brand, isLuhnValid, isLengthValid, isCompletelyValid) {
    let infoHTML = '';
    
    if (!brand) {
        infoHTML = '<p class="info-text">Digite um número de cartão para identificar a bandeira</p>';
    } else {
        infoHTML = `
            <div class="validation-details">
                <p class="brand-detected">🔍 Bandeira detectada: <strong>${brand.name}</strong></p>
                <div class="validation-checks">
                    <div class="check-item ${isLengthValid ? 'valid' : 'invalid'}">
                        ${isLengthValid ? '✅' : '❌'} Comprimento: ${brand.currentLength}/${brand.expectedLengths.join(' ou ')} dígitos
                    </div>
                    <div class="check-item ${isLuhnValid ? 'valid' : 'invalid'}">
                        ${isLuhnValid ? '✅' : '❌'} Algoritmo de Luhn
                    </div>
                    <div class="check-item ${isCompletelyValid ? 'valid' : 'invalid'}">
                        ${isCompletelyValid ? '✅' : '❌'} Número válido
                    </div>
                </div>
                ${!isCompletelyValid ? '<p class="warning">⚠️ Continue digitando ou verifique o número</p>' : ''}
            </div>
        `;
    }
    
    validationInfo.innerHTML = infoHTML;
}

/**
 * Formata o input do usuário em tempo real
 * @param {string} value - Valor atual do input
 */
function formatInput(value) {
    const cleaned = value.replace(/\D/g, '');
    const formatted = cardValidator.formatCardNumber(cleaned);
    return formatted;
}

/**
 * Manipula mudanças no input do número do cartão
 */
function handleCardNumberInput() {
    let currentValue = cardNumberInput.value;
    const cursorPosition = cardNumberInput.selectionStart;
    
    // Formata o input
    const formattedValue = formatInput(currentValue);
    
    // Atualiza o valor no input
    cardNumberInput.value = formattedValue;
    
    // Ajusta a posição do cursor
    const newPosition = Math.min(cursorPosition + (formattedValue.length - currentValue.length), formattedValue.length);
    cardNumberInput.setSelectionRange(newPosition, newPosition);
    
    // Valida e atualiza a exibição
    const validationResult = cardValidator.validateCard(formattedValue);
    updateCardBrandDisplay(validationResult);
}

/**
 * Manipula o clique nos botões de teste
 * @param {Event} event - Evento de clique
 */
function handleTestButtonClick(event) {
    const testNumber = event.target.dataset.number;
    if (testNumber) {
        cardNumberInput.value = cardValidator.formatCardNumber(testNumber);
        handleCardNumberInput();
        
        // Adiciona feedback visual
        event.target.style.transform = 'scale(0.95)';
        setTimeout(() => {
            event.target.style.transform = 'scale(1)';
        }, 150);
    }
}

/**
 * Manipula teclas especiais no input
 * @param {Event} event - Evento de teclado
 */
function handleKeyDown(event) {
    // Permite: backspace, delete, tab, escape, enter
    if ([8, 9, 27, 13, 46].indexOf(event.keyCode) !== -1 ||
        // Permite: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
        (event.keyCode === 65 && event.ctrlKey === true) ||
        (event.keyCode === 67 && event.ctrlKey === true) ||
        (event.keyCode === 86 && event.ctrlKey === true) ||
        (event.keyCode === 88 && event.ctrlKey === true) ||
        // Permite: home, end, left, right
        (event.keyCode >= 35 && event.keyCode <= 39)) {
        return;
    }
    
    // Garante que é um número
    if ((event.shiftKey || (event.keyCode < 48 || event.keyCode > 57)) && (event.keyCode < 96 || event.keyCode > 105)) {
        event.preventDefault();
    }
}

/**
 * Inicializa a aplicação
 */
function initializeApp() {
    // Event listeners
    cardNumberInput.addEventListener('input', handleCardNumberInput);
    cardNumberInput.addEventListener('keydown', handleKeyDown);
    
    // Event listeners para botões de teste
    testButtons.forEach(button => {
        button.addEventListener('click', handleTestButtonClick);
    });
    
    // Adiciona efeito de foco no input
    cardNumberInput.addEventListener('focus', function() {
        this.parentElement.classList.add('focused');
    });
    
    cardNumberInput.addEventListener('blur', function() {
        this.parentElement.classList.remove('focused');
    });
    
    console.log('🤖 Aplicação inicializada com GitHub Copilot!');
    console.log('Bandeiras suportadas:', Object.keys(cardValidator.getSupportedBrands()));
}

/**
 * Demonstra as capacidades da aplicação no console
 */
function demonstrateFeatures() {
    console.log('\n🎯 Demonstração das funcionalidades:');
    
    const testNumbers = cardValidator.getTestNumbers();
    
    Object.entries(testNumbers).forEach(([brand, number]) => {
        const result = cardValidator.validateCard(number);
        console.log(`${brand.toUpperCase()}: ${number} → ${result.brand?.name} (${result.isCompletelyValid ? 'Válido' : 'Inválido'})`);
    });
}

// Inicializa quando o DOM estiver carregado
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}

// Demonstra funcionalidades no console (para desenvolvimento)
setTimeout(demonstrateFeatures, 1000);
