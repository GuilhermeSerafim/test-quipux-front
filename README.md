# Test Quipux - Frontend

Este é o repositório do frontend para o projeto **Test Quipux**, desenvolvido utilizando **React**.

## Tecnologias Utilizadas

- **React**: Framework principal para o desenvolvimento.
- **Material UI (MUI)**: Biblioteca de componentes para estilização.
- **React Router**: Gerenciamento de rotas na aplicação.
## Como Executar

1. Clone este repositório:
   ```bash
   git clone https://github.com/GuilhermeSerafim/test-quipux-front.git
   ```

2. Navegue até o diretório do projeto:
   ```bash
   cd test-quipux-front
   ```

3. Instale as dependências:
   ```bash
   npm install
   ```

4. Inicie o servidor de desenvolvimento:
   ```bash
   npm start
   ```

5. A aplicação estará disponível em:
   ```
   http://localhost:3000
   ```

## Funcionalidades

- **Adicionar Playlist**: Crie playlists com nome, descrição e músicas.
- **Pesquisar Playlists**: Use a barra de busca para filtrar playlists pelo nome.
- **Remover Playlists**: Exclua playlists existentes diretamente na interface.
- - **Listar Playlists**: Exibe todas as playlists disponíveis, apresentando informações como nome, descrição e músicas associadas.

## Integração com o Backend

Certifique-se de que o backend está em execução para que o frontend possa consumir os dados corretamente.


## [Deploy](https://test-quipux-front-1nz81exu6-guilhermeserafims-projects.vercel.app)
O deploy foi realizado para fins de visualização do design. Para o funcionamento completo da aplicação, é necessário ativar o backend e configurar a chave de autenticação para todas as requisições. Alternativamente, você pode desabilitar temporariamente a autenticação no backend ajustando a configuração de segurança no arquivo [SecurityConfig](https://github.com/GuilhermeSerafim/test-quipux-back/blob/main/src/main/java/com/example/demo/infrastructure/config/SecurityConfig.java).
