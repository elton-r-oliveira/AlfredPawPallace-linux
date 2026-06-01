module.exports = {
  apps: [
    {
      name: 'alfred-api',
      script: 'index.js',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        DB_HOST: 'SEU_IP_DO_BANCO',
        DB_USER: 'SEU_USUARIO',
        DB_PASS: 'SUA_SENHA',
        DB_NAME: 'BDAlfredPawPalace',
        JWT_SECRET: 'COLOQUE_UM_SECRET_FORTE_AQUI',
        CODIGO_FUNCIONARIO: 'SEU_CODIGO',
      },
    },
  ],
};
