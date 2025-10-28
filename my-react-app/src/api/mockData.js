// Mock data para testes locais
export const mockUsers = [
    {
        username: 'aluno1',
        password: 'senha123',
        token: 'mock-jwt-token-aluno1-xyz123abc456',
        id: 1,
        tipo: 'Aluno'
    },
    {
        username: 'teste',
        password: 'teste',
        token: 'mock-jwt-token-teste-abc789def012',
        id: 2,
        tipo: 'Aluno'
    },
    {
        username: 'professor',
        password: 'professor',
        token: 'mock-jwt-token-professor-prof123',
        id: 3,
        tipo: 'Professor'
    },
];

export const mockStats = {
    quizzesCompleted: 12,
    accuracy: 78,
    materialsAccessed: 25,
    totalPoints: 1850,
};

// Mock data para temas
export const mockTemas = [
    {
        id: 1,
        nome: 'Matemática',
        descricao: 'Aprende conceitos fundamentais de matemática e álgebra.',
        criacao: '2025-01-15T10:00:00Z',
        ativo: true,
    },
    {
        id: 2,
        nome: 'Física',
        descricao: 'Explora as leis da física e mecânica.',
        criacao: '2025-01-15T10:30:00Z',
        ativo: true,
    },
    {
        id: 3,
        nome: 'Química',
        descricao: 'Descobre reações químicas e compostos.',
        criacao: '2025-01-15T11:00:00Z',
        ativo: true,
    },
    {
        id: 4,
        nome: 'Biologia',
        descricao: 'Estuda organismos vivos e ecossistemas.',
        criacao: '2025-01-16T09:00:00Z',
        ativo: true,
    },
    {
        id: 5,
        nome: 'História',
        descricao: 'Viaja através dos eventos históricos.',
        criacao: '2025-01-16T10:00:00Z',
        ativo: true,
    },
    {
        id: 6,
        nome: 'Geografia',
        descricao: 'Explora o mundo e suas características.',
        criacao: '2025-01-16T11:00:00Z',
        ativo: true,
    },
];

export const mockQuestions = {
    math: [
        {
            id: 'math-q1',
            question: 'Qual é o resultado de 2 + 2?',
            options: ['3', '4', '5', '6'],
            correctAnswer: '4',
            explanation: 'A soma de 2 + 2 é igual a 4. Esta é uma operação básica de adição.',
            suggestedCid: 'QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG',
        },
        {
            id: 'math-q2',
            question: 'Qual é a raiz quadrada de 16?',
            options: ['2', '3', '4', '8'],
            correctAnswer: '4',
            explanation: 'A raiz quadrada de 16 é 4, porque 4 × 4 = 16.',
            suggestedCid: 'QmT5NvUtoM5nWFfrQdVrFtvGfKFmG7AHE8P34isapyhCxX',
        },
        {
            id: 'math-q3',
            question: 'Quanto é 15% de 200?',
            options: ['20', '25', '30', '35'],
            correctAnswer: '30',
            explanation: 'Para calcular 15% de 200, multiplicamos 200 × 0.15 = 30.',
            suggestedCid: 'QmPZ9gcCEpqKTo6aq61g4nffcdLpJL7mHMEWGBcv2WR2Mj',
        },
    ],
    physics: [
        {
            id: 'physics-q1',
            question: 'Qual é a velocidade da luz no vácuo?',
            options: ['300.000 km/s', '150.000 km/s', '450.000 km/s', '600.000 km/s'],
            correctAnswer: '300.000 km/s',
            explanation: 'A velocidade da luz no vácuo é aproximadamente 300.000 km/s ou 3 × 10⁸ m/s.',
            suggestedCid: 'QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco',
        },
        {
            id: 'physics-q2',
            question: 'Qual é a unidade de força no Sistema Internacional?',
            options: ['Joule', 'Newton', 'Watt', 'Pascal'],
            correctAnswer: 'Newton',
            explanation: 'O Newton (N) é a unidade de força no SI. 1 N = 1 kg⋅m/s².',
            suggestedCid: 'QmYjtig7VJQ6XsnUjqqJvj7QaMcCAwtrgNdahSiFofrE7o',
        },
    ],
    chemistry: [
        {
            id: 'chem-q1',
            question: 'Qual é a fórmula química da água?',
            options: ['H2O', 'CO2', 'O2', 'H2O2'],
            correctAnswer: 'H2O',
            explanation: 'A água é composta por dois átomos de hidrogénio e um átomo de oxigénio: H₂O.',
            suggestedCid: 'QmRQGuVFHLVYk4vqLzxjFzJpK7c6p2HZQQTZ7zFKKsLZUu',
        },
        {
            id: 'chem-q2',
            question: 'Qual é o número atómico do Carbono?',
            options: ['4', '6', '8', '12'],
            correctAnswer: '6',
            explanation: 'O carbono tem número atómico 6, o que significa que tem 6 protões no núcleo.',
            suggestedCid: 'QmZTR5bcpQD7cFgTorqxZDYaew1Wqgfbd2ud9QqGPAkK2V',
        },
    ],
    biology: [
        {
            id: 'bio-q1',
            question: 'Quantos cromossomas tem uma célula humana normal?',
            options: ['23', '46', '48', '92'],
            correctAnswer: '46',
            explanation: 'Uma célula humana normal tem 46 cromossomas: 23 pares (22 autossómicos + 1 par sexual).',
            suggestedCid: 'QmWboFP8XeBtFMbNYK3Ne8Z3gKFBSR5iQzkKsyorLn5hYJ',
        },
        {
            id: 'bio-q2',
            question: 'Qual é a função das mitocôndrias?',
            options: [
                'Fotossíntese',
                'Produção de energia',
                'Síntese de proteínas',
                'Divisão celular',
            ],
            correctAnswer: 'Produção de energia',
            explanation: 'As mitocôndrias são responsáveis pela produção de ATP, a energia da célula.',
            suggestedCid: 'QmQPeNsJPyVWPFDVHb77w8G1Fz5LDpZLHkYXHLsFx9BYD6',
        },
    ],
    history: [
        {
            id: 'hist-q1',
            question: 'Em que ano foi descoberto o Brasil?',
            options: ['1492', '1500', '1520', '1530'],
            correctAnswer: '1500',
            explanation: 'O Brasil foi descoberto por Pedro Álvares Cabral em 22 de abril de 1500.',
            suggestedCid: 'QmYHNbKwJECB2XWnF8gA5Vq89Z8Xu8j8Q3qjZkVR8wYMbX',
        },
        {
            id: 'hist-q2',
            question: 'Quem foi o primeiro Presidente dos Estados Unidos?',
            options: [
                'Thomas Jefferson',
                'Benjamin Franklin',
                'George Washington',
                'John Adams',
            ],
            correctAnswer: 'George Washington',
            explanation: 'George Washington foi o primeiro Presidente dos EUA (1789-1797).',
            suggestedCid: 'QmUNLLsPACCz1vLxQVkXqqLX5R1X9bFfTbBbeNWbEorSEy',
        },
    ],
    geography: [
        {
            id: 'geo-q1',
            question: 'Qual é o maior oceano do mundo?',
            options: ['Atlântico', 'Índico', 'Pacífico', 'Ártico'],
            correctAnswer: 'Pacífico',
            explanation: 'O Oceano Pacífico é o maior oceano, cobrindo cerca de 165 milhões de km².',
            suggestedCid: 'QmVjkn7yEqb6ziKfahhHEH9ekNs84QJ2bYMCKmDQT1XR7R',
        },
        {
            id: 'geo-q2',
            question: 'Qual é a capital de Portugal?',
            options: ['Porto', 'Lisboa', 'Coimbra', 'Faro'],
            correctAnswer: 'Lisboa',
            explanation: 'Lisboa é a capital e maior cidade de Portugal, localizada na costa atlântica.',
            suggestedCid: 'QmRxTvXALjTh7Mz6qMi8eBECbK8xT8z2JQ9jPW5vVnYxEi',
        },
    ],
};

// Simulador de estado do quiz para cada sessão
export class MockQuizSession {
    constructor(topic) {
        this.topic = topic;
        this.questions = [...(mockQuestions[topic] || [])];
        this.currentIndex = 0;
        this.score = 0;
    }

    getCurrentQuestion() {
        if (this.currentIndex >= this.questions.length) {
            return null;
        }
        const question = this.questions[this.currentIndex];
        return {
            id: question.id,
            question: question.question,
            options: question.options,
        };
    }

    submitAnswer(questionId, answer) {
        const question = this.questions.find((q) => q.id === questionId);
        if (!question) {
            return { error: 'Pergunta não encontrada' };
        }

        const isCorrect = answer === question.correctAnswer;
        if (isCorrect) {
            this.score++;
        }

        const response = {
            correct: isCorrect,
            correctAnswer: question.correctAnswer,
            quizCompleted: this.currentIndex >= this.questions.length - 1,
        };

        if (!isCorrect) {
            response.explanation = question.explanation;
            response.suggestedCid = question.suggestedCid;
        }

        this.currentIndex++;
        return response;
    }

    getResults() {
        return {
            score: this.score,
            total: this.questions.length,
            percentage: Math.round((this.score / this.questions.length) * 100),
        };
    }
}

// Armazenamento de sessões ativas (simula estado do servidor)
export const activeSessions = new Map();
