// Carregado por --require no npm test, antes de qualquer módulo ler o .env
Object.assign(process.env, {
    NODE_ENV: 'test',
    DB_HOST: process.env.TEST_DB_HOST ?? '127.0.0.1',
    DB_PORT: process.env.TEST_DB_PORT ?? '33306',
    DB_USERNAME: process.env.TEST_DB_USERNAME ?? 'root',
    DB_PASSWORD: process.env.TEST_DB_PASSWORD ?? 'test',
    DB_NAME: process.env.TEST_DB_NAME ?? 'healthly_test',
    JWT_SECRET: 'test-secret',
    JWT_EXPIRES_IN: '3600',
    PORT: '3999',
    CORS_ORIGINS: 'http://localhost:8081'
})
