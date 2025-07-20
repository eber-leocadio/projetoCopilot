/**
 * Classe responsável por identificar e validar bandeiras de cartão de crédito
 * Utiliza expressões regulares para identificar as bandeiras baseado nos primeiros dígitos
 */
class CardValidator {
    constructor() {
        // Definindo as regras para identificação das bandeiras
        this.cardPatterns = {
            visa: {
                pattern: /^4[0-9]{0,}$/,
                length: [13, 16, 19],
                name: 'Visa',
                color: '#1A1F71',
                icon: '💳'
            },
            mastercard: {
                pattern: /^5[1-5][0-9]{0,}$|^2(?:2(?:2[1-9]|[3-9][0-9])|[3-6][0-9][0-9]|7(?:[01][0-9]|20))[0-9]{0,}$/,
                length: [16],
                name: 'MasterCard',
                color: '#EB001B',
                icon: '💳'
            },
            amex: {
                pattern: /^3[47][0-9]{0,}$/,
                length: [15],
                name: 'American Express',
                color: '#006FCF',
                icon: '💳'
            },
            discover: {
                pattern: /^6(?:011|5[0-9]{2})[0-9]{0,}$/,
                length: [16],
                name: 'Discover',
                color: '#FF6000',
                icon: '💳'
            },
            dinersclub: {
                pattern: /^3(?:0[0-5]|[68][0-9])[0-9]{0,}$/,
                length: [14],
                name: 'Diners Club',
                color: '#0079BE',
                icon: '💳'
            },
            jcb: {
                pattern: /^(?:2131|1800|35[0-9]{0,}$)/,
                length: [16],
                name: 'JCB',
                color: '#005BAC',
                icon: '💳'
            },
            elo: {
                pattern: /^(?:4011(78|79)|43(1274|8935)|45(1416|7393|763(1|2))|50(4175|6699|67[0-6][0-9]|677[0-8]|9[0-8][0-9]{2}|99[0-8][0-9]|999[0-9])|627780|63(6297|6368|6369)|65(0(0(0[5-9]|[1-9][0-9])|[1-9][0-9]{2})|[1-9][0-9]{3})|65165[2-9]|6516[6-7][0-9]|65500[0-9]|6550[0-5][0-9]|655021|65505[0-9]|6516[8-9][0-9]|65170[0-4])/,
                length: [16],
                name: 'Elo',
                color: '#FFD700',
                icon: '💳'
            },
            hipercard: {
                pattern: /^(606282\d{10}(\d{3})?)|(3841\d{15})$/,
                length: [13, 16, 19],
                name: 'Hipercard',
                color: '#8B0000',
                icon: '💳'
            }
        };
    }

    /**
     * Remove caracteres não numéricos do número do cartão
     * @param {string} cardNumber - Número do cartão com possíveis caracteres especiais
     * @returns {string} Número do cartão apenas com dígitos
     */
    cleanCardNumber(cardNumber) {
        return cardNumber.replace(/\D/g, '');
    }

    /**
     * Formata o número do cartão adicionando espaços
     * @param {string} cardNumber - Número do cartão
     * @returns {string} Número formatado com espaços
     */
    formatCardNumber(cardNumber) {
        const cleaned = this.cleanCardNumber(cardNumber);
        const match = cleaned.match(/\d{1,4}/g);
        return match ? match.join(' ') : '';
    }

    /**
     * Identifica a bandeira do cartão baseado no número
     * @param {string} cardNumber - Número do cartão
     * @returns {object|null} Objeto com informações da bandeira ou null se não identificada
     */
    identifyCardBrand(cardNumber) {
        const cleaned = this.cleanCardNumber(cardNumber);
        
        if (!cleaned) {
            return null;
        }

        // Verifica cada padrão de bandeira
        for (const [key, brand] of Object.entries(this.cardPatterns)) {
            if (brand.pattern.test(cleaned)) {
                return {
                    type: key,
                    name: brand.name,
                    color: brand.color,
                    icon: brand.icon,
                    isValidLength: brand.length.includes(cleaned.length),
                    expectedLengths: brand.length,
                    currentLength: cleaned.length
                };
            }
        }

        return null;
    }

    /**
     * Implementa o algoritmo de Luhn para validar o número do cartão
     * @param {string} cardNumber - Número do cartão
     * @returns {boolean} True se o número é válido segundo o algoritmo de Luhn
     */
    validateLuhnAlgorithm(cardNumber) {
        const cleaned = this.cleanCardNumber(cardNumber);
        
        if (cleaned.length < 2) {
            return false;
        }

        let sum = 0;
        let shouldDouble = false;

        // Percorre o número de trás para frente
        for (let i = cleaned.length - 1; i >= 0; i--) {
            let digit = parseInt(cleaned.charAt(i), 10);

            if (shouldDouble) {
                digit *= 2;
                if (digit > 9) {
                    digit -= 9;
                }
            }

            sum += digit;
            shouldDouble = !shouldDouble;
        }

        return (sum % 10) === 0;
    }

    /**
     * Validação completa do cartão (bandeira + Luhn + comprimento)
     * @param {string} cardNumber - Número do cartão
     * @returns {object} Objeto com resultado da validação completa
     */
    validateCard(cardNumber) {
        const brand = this.identifyCardBrand(cardNumber);
        const cleaned = this.cleanCardNumber(cardNumber);
        const isLuhnValid = this.validateLuhnAlgorithm(cardNumber);

        return {
            brand: brand,
            isLuhnValid: isLuhnValid,
            isLengthValid: brand ? brand.isValidLength : false,
            isCompletelyValid: brand && brand.isValidLength && isLuhnValid,
            cardNumber: cleaned,
            formattedNumber: this.formatCardNumber(cardNumber)
        };
    }

    /**
     * Retorna informações sobre todas as bandeiras suportadas
     * @returns {object} Objeto com informações de todas as bandeiras
     */
    getSupportedBrands() {
        return this.cardPatterns;
    }

    /**
     * Gera números de teste válidos para cada bandeira
     * @returns {object} Objeto com números de teste para cada bandeira
     */
    getTestNumbers() {
        return {
            visa: '4532015112830366',
            mastercard: '5555555555554444',
            amex: '378282246310005',
            discover: '6011111111111117',
            dinersclub: '30569309025904',
            jcb: '3530111333300000',
            // Números de teste brasileiros
            elo: '6362970000457013',
            hipercard: '6062825624254001'
        };
    }
}

// Exporta a classe para uso em outros arquivos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CardValidator;
}
