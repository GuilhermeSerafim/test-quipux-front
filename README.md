# Test Quipux — Frontend

React, Material UI e React Router para criar, listar, filtrar e excluir playlists.

## Execução local

1. Use Node.js e npm (validado com Node 22 e npm 10).
2. Execute `npm ci`.
3. Inicie o [backend](https://github.com/GuilhermeSerafim/test-quipux-back) com a autenticação HTTP Basic habilitada, uma conta de desenvolvimento própria e a porta **18080**. O backend atual requer JDK 23. Configure suas credenciais no servidor, fora do frontend.
4. Execute `npm start` e abra http://localhost:3000.
5. Entre com o usuário e a senha dessa conta. A tela valida o acesso com GET /lists antes de liberar as ações.

O proxy de desenvolvimento em package.json encaminha /lists para http://127.0.0.1:18080. Ajuste somente o endereço se seu backend usar outra porta. Esse proxy é exclusivo de `npm start`.

## Autenticação e configuração

O servidor existente usa HTTP Basic; não há endpoint de emissão ou renovação de tokens. O frontend mantém a autorização somente na memória da aba. Não grava credenciais em localStorage, sessionStorage ou cookies. O campo de senha é limpo ao enviar o formulário. Recarregar a página, fechar a aba ou usar **Sair / trocar conta** encerra o acesso local.

Cada operação utiliza a sessão atual. Respostas atrasadas de login, listagem, criação ou exclusão não alteram a próxima sessão. Um HTTP 401 da sessão atual retorna à tela de login; HTTP 403 apresenta falha sem encerrar a sessão. Não existe um prazo de expiração inventado no cliente: a invalidação é detectada na próxima resposta 401 do servidor. Sair não revoga uma conta Basic no servidor e não desfaz operações que ele já tenha processado.

Por padrão a API usa a mesma origem da aplicação. Para uma URL/base diferente, copie .env.example para .env.local, ajuste REACT_APP_API_BASE_URL e reinicie o servidor ou gere novamente o build. Variáveis REACT_APP_* são públicas no bundle: nunca coloque senhas, tokens ou valores de Authorization nelas.

Em produção, sirva a aplicação e a API por HTTPS. O cliente recusa HTTP fora de localhost/loopback. Configure um gateway HTTPS da mesma origem encaminhando /lists ao backend. Outra origem requer CORS configurado corretamente no servidor para a origem, os métodos GET/POST/DELETE e os cabeçalhos Authorization/Content-Type; isso não é configurado por este frontend. Mantenha a autenticação do backend habilitada. Não siga redirecionamentos da API.

## Verificação

- `npm run build`: bundle de produção.
- `npm test -- --watchAll=false --runInBand`: React montado em jsdom, com rede simulada; cobre login, logout, 401, retry e concorrência entre sessões.
- `node --test verification/no-embedded-authorization.test.cjs`: impede credenciais literais passadas a btoa no código cliente.

A integração foi exercitada localmente no Chromium, com o build real e o backend Spring Boot original, HTTP Basic ativo, H2 descartável e conta sintética. Login inválido/válido e GET/POST/DELETE foram verificados sem serviços produtivos. Essa validação não comprova disponibilidade, configuração CORS, TLS ou contas em um ambiente publicado.

O [guia de integração local](verification/INTEGRATION.md) inclui os comandos, a configuração descartável e o servidor de teste para reproduzir o fluxo e a invalidação real de credenciais.

## Demonstração histórica

O [deploy de demonstração](https://test-quipux-front-1nz81exu6-guilhermeserafims-projects.vercel.app) foi publicado para visualizar o design. Ele não comprova que esta versão, uma API ou uma conta funcional estejam implantadas.
