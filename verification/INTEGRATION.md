# Reprodução da integração local

Requisitos: Node.js 22/npm 10, Python 3, JDK 23 e Chromium/Chrome. A validação de 06/11/2026 usou frontend base cc426cd9dc9ae4e5cf60f3a9787641313dd4e393 e backend base 86a9b62e2c9edb57282f7a03620c6d8448ff86e3.

Todos os passos usam loopback, uma conta sintética escolhida para este teste e H2 em memória. Não use uma conta produtiva ou valores encontrados no histórico dos repositórios.

## 1. Backend original, com segurança habilitada

Clone o [backend](https://github.com/GuilhermeSerafim/test-quipux-back) em uma pasta de teste. Para reproduzir exatamente a base validada, faça checkout do commit acima. Não edite SecurityConfig ou controllers.

No PowerShell, dentro desse checkout:

```powershell
# Configure JAVA_HOME para um JDK 23 existente antes deste comando.
.\gradlew.bat --no-daemon --max-workers=1 "-Dorg.gradle.jvmargs=-Xmx512m" bootJar
```

Em seguida, configure o caminho absoluto do checkout frontend desta versão e forneça uma senha exclusiva de teste:

```powershell
$quipuxFrontend = (Resolve-Path (Read-Host "Pasta do checkout frontend")).Path
$quipuxConfig = (Resolve-Path (Join-Path $quipuxFrontend 'verification/backend-validation.properties')).Path
$quipuxConfigUri = ([uri]$quipuxConfig).AbsoluteUri
$env:SPRING_SECURITY_USER_NAME = 'quipux-validation'
$quipuxPassword = Read-Host "Escolha uma senha sintética para este teste" -AsSecureString
$env:SPRING_SECURITY_USER_PASSWORD = [System.Net.NetworkCredential]::new('', $quipuxPassword).Password
try {
    & "$env:JAVA_HOME/bin/java.exe" -Xmx384m -jar build/libs/demo-0.0.1-SNAPSHOT.jar "--spring.config.location=$quipuxConfigUri"
} finally {
    Remove-Item Env:SPRING_SECURITY_USER_NAME, Env:SPRING_SECURITY_USER_PASSWORD -ErrorAction SilentlyContinue
    $quipuxPassword = $null
}
```

A configuração publicada em verification/backend-validation.properties substitui a configuração padrão, usa H2 descartável e escuta somente 127.0.0.1:18080. O SecurityFilterChain original continua ativo. Aguarde a mensagem de inicialização da porta 18080.

## 2. Build real do frontend

Em outro terminal, no checkout frontend:

```powershell
npm ci
$env:CI = 'true'
npm test -- --watchAll=false --runInBand
node --test verification/no-embedded-authorization.test.cjs
npm run build
python verification/serve-build.py
```

O último comando é um servidor de teste para o build, com proxy da mesma origem, em http://127.0.0.1:13000. Não é um servidor produtivo. Todos os arquivos necessários para esse passo acompanham o repositório.

O proxy recusa respostas 3xx do backend com 502, sem seguir Location nem encaminhar a requisição/Authorization ao destino. A opção redirect=error do frontend não substitui essa proteção dentro do proxy. Para verificar esse comportamento, com a porta 18080 livre e sem iniciar o backend, execute:

```powershell
python -B -m unittest discover -s verification -p test_serve_build.py -v
```

O teste usa apenas servidores em loopback, credencial sintética e portas locais temporárias (18080 para o backend simulado). Cobre GET/POST/DELETE com 301/302/303/307/308, confirma zero requisições ao destino e preservação de uma resposta normal 200. Os servidores são encerrados automaticamente, inclusive em caso de falha.

Alternativamente, `npm start` usa o proxy de desenvolvimento configurado em package.json, com a mesma API local. A execução registrada validou o **build de produção servido pelo proxy local**, não o servidor de desenvolvimento CRA.

## 3. Fluxo no navegador

Abra http://127.0.0.1:13000 em uma aba nova. Se preferir Playwright CLI:

```powershell
npx --yes --package @playwright/cli playwright-cli -s=quipux-check open http://127.0.0.1:13000 --headed
npx --yes --package @playwright/cli playwright-cli -s=quipux-check snapshot
```

Use a interface e confira os status na aba Network. Nunca exporte cabeçalhos Authorization.

1. Antes de entrar, as ações de playlists ficam bloqueadas e não há chamada automática à API.
2. Entre com uma conta sintética incorreta: GET /lists retorna 401 e aparece a mensagem de credenciais inválidas.
3. Entre com quipux-validation e a senha fornecida no terminal: GET /lists retorna 200.
4. Crie uma playlist chamada **Sessão verão 2026**, com descrição e uma música preenchida. Use Adicionar Música, depois Enviar Playlist: POST /lists retorna 201 e a tela confirma.
5. Abra Ver playlists: GET /lists retorna 200 e exibe a música criada.
6. Pesquise um texto inexistente e depois **vErÃo**: a playlist desaparece e reaparece.
7. Exclua a playlist: DELETE /lists/Sess%C3%A3o%20ver%C3%A3o%202026 retorna 204. Saia dessa rota e volte para confirmar a remoção em um novo GET.
8. Use Sair / trocar conta: a tela volta ao login, sem senha preenchida. Entre novamente.
9. Recarregue a aba: o login volta a ser necessário. LocalStorage, SessionStorage e cookies da aplicação permanecem vazios.

Para reproduzir a invalidação real: entre, abra Adicionar playlist, pare apenas esse backend com Ctrl+C e reinicie o mesmo comando com **outra senha sintética**. Quando estiver pronto, clique em Ver playlists na aba que ainda mantém a sessão antiga. O GET retorna 401 e a aplicação mostra “Sua sessão não é mais válida. Entre novamente.” Entre com a nova senha para continuar. O H2 também é reiniciado por ser descartável.

Os casos de resposta tardia, cancelamento de login, retry e HTTP 403 são reproduzidos pelos testes React em src/routes.session.test.js. Esses testes montam os componentes reais com StrictMode e simulam somente a rede; não comprovam permissões reais de um servidor.

## 4. Encerramento e limites

Feche somente a sessão de navegador criada para o teste:

```powershell
npx --yes --package @playwright/cli playwright-cli -s=quipux-check close
```

Use Ctrl+C nos dois terminais que executam o backend e o proxy. A configuração e os passos não modificam o código do backend.

A validação não implanta produção, não configura TLS/CORS remotos e não revoga contas reais. Sair limpa o estado da aba; operações já processadas no servidor não são desfeitas. A invalidação é detectada quando uma operação recebe 401, não por um temporizador de expiração.
