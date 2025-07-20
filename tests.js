/**
 * Testes unitários para o CardValidator
 * Demonstra como testar a lógica de validação de cartões
 */

// Simulação simples de framework de testes
class SimpleTest {
    constructor() {
        this.tests = [];
        this.passed = 0;
        this.failed = 0;
    }
    
    test(description, testFunction) {
        try {
            testFunction();
            this.passed++;
            console.log(`✅ ${description}`);
        } catch (error) {
            this.failed++;
            console.error(`❌ ${description}: ${error.message}`);
        }
    }
    
    assertEqual(actual, expected, message = '') {
        if (actual !== expected) {
            throw new Error(`${message} - Expected: ${expected}, Got: ${actual}`);
        }
    }
    
    assertTrue(condition, message = '') {
        if (!condition) {
            throw new Error(`${message} - Expected true, got false`);
        }
    }
    
    assertFalse(condition, message = '') {
        if (condition) {
            throw new Error(`${message} - Expected false, got true`);
        }
    }
    
    run() {
        console.log('\n🧪 Executando testes...\n');
        return {
            passed: this.passed,
            failed: this.failed,
            total: this.passed + this.failed
        };
    }
}

// Função para executar todos os testes
function runCardValidatorTests() {
    const test = new SimpleTest();
    const validator = new CardValidator();
    
    // Testes de limpeza de número
    test.test('Deve limpar caracteres especiais do número do cartão', () => {
        test.assertEqual(validator.cleanCardNumber('4532-0151-1283-0366'), '4532015112830366');
        test.assertEqual(validator.cleanCardNumber('4532 0151 1283 0366'), '4532015112830366');
        test.assertEqual(validator.cleanCardNumber('4532.0151.1283.0366'), '4532015112830366');
    });
    
    // Testes de formatação
    test.test('Deve formatar número do cartão com espaços', () => {
        test.assertEqual(validator.formatCardNumber('4532015112830366'), '4532 0151 1283 0366');
        test.assertEqual(validator.formatCardNumber('378282246310005'), '3782 8224 6310 005');
    });
    
    // Testes de identificação de bandeira - Visa
    test.test('Deve identificar cartão Visa', () => {
        const result = validator.identifyCardBrand('4532015112830366');
        test.assertEqual(result.name, 'Visa');
        test.assertEqual(result.type, 'visa');
        test.assertTrue(result.isValidLength);
    });
    
    // Testes de identificação de bandeira - MasterCard
    test.test('Deve identificar cartão MasterCard', () => {
        const result = validator.identifyCardBrand('5555555555554444');
        test.assertEqual(result.name, 'MasterCard');
        test.assertEqual(result.type, 'mastercard');
        test.assertTrue(result.isValidLength);
    });
    
    // Testes de identificação de bandeira - Amex
    test.test('Deve identificar cartão American Express', () => {
        const result = validator.identifyCardBrand('378282246310005');
        test.assertEqual(result.name, 'American Express');
        test.assertEqual(result.type, 'amex');
        test.assertTrue(result.isValidLength);
    });
    
    // Testes de identificação de bandeira - Discover
    test.test('Deve identificar cartão Discover', () => {
        const result = validator.identifyCardBrand('6011111111111117');
        test.assertEqual(result.name, 'Discover');
        test.assertEqual(result.type, 'discover');
        test.assertTrue(result.isValidLength);
    });
    
    // Testes de validação Luhn
    test.test('Deve validar números válidos com algoritmo de Luhn', () => {
        test.assertTrue(validator.validateLuhnAlgorithm('4532015112830366'));
        test.assertTrue(validator.validateLuhnAlgorithm('5555555555554444'));
        test.assertTrue(validator.validateLuhnAlgorithm('378282246310005'));
    });
    
    test.test('Deve rejeitar números inválidos com algoritmo de Luhn', () => {
        test.assertFalse(validator.validateLuhnAlgorithm('4532015112830365'));
        test.assertFalse(validator.validateLuhnAlgorithm('1234567890123456'));
        test.assertFalse(validator.validateLuhnAlgorithm('0000000000000000'));
    });
    
    // Testes de validação completa
    test.test('Deve validar cartão completamente válido', () => {
        const result = validator.validateCard('4532015112830366');
        test.assertTrue(result.isCompletelyValid);
        test.assertTrue(result.isLuhnValid);
        test.assertTrue(result.isLengthValid);
        test.assertEqual(result.brand.name, 'Visa');
    });
    
    test.test('Deve rejeitar cartão com número inválido', () => {
        const result = validator.validateCard('4532015112830365');
        test.assertFalse(result.isCompletelyValid);
        test.assertFalse(result.isLuhnValid);
        test.assertTrue(result.isLengthValid);
        test.assertEqual(result.brand.name, 'Visa');
    });
    
    // Testes de casos edge
    test.test('Deve retornar null para número vazio', () => {
        const result = validator.identifyCardBrand('');
        test.assertEqual(result, null);
    });
    
    test.test('Deve retornar null para número com apenas espaços', () => {
        const result = validator.identifyCardBrand('   ');
        test.assertEqual(result, null);
    });
    
    test.test('Deve identificar bandeira mesmo com formatação', () => {
        const result = validator.identifyCardBrand('4532-0151-1283-0366');
        test.assertEqual(result.name, 'Visa');
    });
    
    // Testes de números brasileiros
    test.test('Deve identificar cartão Elo', () => {
        const result = validator.identifyCardBrand('6362970000457013');
        test.assertEqual(result.name, 'Elo');
        test.assertEqual(result.type, 'elo');
    });
    
    test.test('Deve identificar cartão Hipercard', () => {
        const result = validator.identifyCardBrand('6062825624254001');
        test.assertEqual(result.name, 'Hipercard');
        test.assertEqual(result.type, 'hipercard');
    });
    
    // Teste de números de teste
    test.test('Deve retornar números de teste válidos', () => {
        const testNumbers = validator.getTestNumbers();
        test.assertTrue(Object.keys(testNumbers).length > 0);
        
        // Verifica se os números de teste são válidos
        Object.entries(testNumbers).forEach(([brand, number]) => {
            const result = validator.validateCard(number);
            test.assertTrue(result.brand !== null, `Número de teste para ${brand} deve ter bandeira identificada`);
        });
    });
    
    const results = test.run();
    
    console.log(`\n📊 Resultado dos testes:`);
    console.log(`   ✅ Passou: ${results.passed}`);
    console.log(`   ❌ Falhou: ${results.failed}`);
    console.log(`   📈 Total: ${results.total}`);
    console.log(`   🎯 Taxa de sucesso: ${((results.passed / results.total) * 100).toFixed(1)}%`);
    
    return results;
}

// Executa os testes se estivermos em ambiente Node.js
if (typeof module !== 'undefined' && module.exports) {
    const CardValidator = require('./cardValidator.js');
    module.exports = { runCardValidatorTests };
} else {
    // Executa automaticamente no navegador após um delay
    setTimeout(() => {
        if (typeof CardValidator !== 'undefined') {
            runCardValidatorTests();
        }
    }, 2000);
}
