# English 52 Weeks 🇺🇸📚

Aplicativo pessoal (PWA) para aprender inglês em **52 semanas**, pensado para um adulto brasileiro de nível **A2**.
Funciona **100% offline**, sem servidor, e pode ser instalado no celular ou no computador como um app nativo.

> Interface bilíngue: português primeiro, inglês em seguida (ex.: “Semana atual / Current week”).

## ✨ Funcionalidades

- **Início** – anel animado com o % do ano, semana atual, palavras aprendidas (x / 368), livros (x / 26), vídeos (x / 52), sequência de dias e mapa de calor das 52 semanas.
- **Semanas** – as 52 semanas agrupadas por trimestre, com anel de progresso e cadeado (a semana libera quando a anterior chega a 70%, ou use “Desbloquear tudo”).
- **Semana** – abas *Palavras*, *Frases*, *Livro* e *Vídeo*, com áudio (voz en-US), checkboxes, “Minha frase” e anotações do livro.
- **Cartões (Flashcards)** – cartão 3D que vira, gestos de deslizar no celular e atalhos de teclado (← → espaço).
- **Quiz** – 5 perguntas geradas automaticamente (EN→PT, PT→EN e “ouça e escolha”). Nota ≥ 80% = aprovado.
- **Revisão** – repetição espaçada estilo Leitner (1, 3, 7, 14 e 30 dias) com contador no menu.
- **Evolução** – gráficos (palavras aprendidas × planejado, % por semana, blocos concluídos, atividade) e conquistas.
- **Configurações** – data de início, lembrete diário, modo escuro, desbloquear tudo, backup (exportar/importar JSON) e apagar progresso.

Todo o conteúdo vem de [`src/data/weeks.json`](src/data/weeks.json). O progresso fica salvo no navegador (`localStorage`, chave `e52-progress`).

### Regras de progresso

- **% da semana** = palavras × 40% + frases × 20% + livro × 20% + vídeo × 20% (pesos definidos no `weeks.json`).
- **% do ano** = média das 52 semanas.
- **Sequência (streak)** = dias seguidos com pelo menos uma ação.

## 🛠️ Tecnologias

React 18 · Vite · TypeScript · Tailwind CSS · Framer Motion · Recharts · lucide-react · Zustand · React Router (HashRouter) · vite-plugin-pwa · Web Speech API · canvas-confetti

## 🚀 Como rodar

### Jeito mais fácil (Windows)

Dê **dois cliques** no arquivo **`Iniciar English 52.bat`** dentro da pasta do projeto.
Uma janela preta vai abrir e, em alguns segundos, o app abre sozinho no navegador.
Para fechar o app, feche a janela preta.

### Pelo terminal

Pré-requisito: [Node.js](https://nodejs.org/) 18 ou superior.

```bash
# 1. Instalar as dependências
npm install

# 2. Rodar em modo desenvolvimento (abre em http://localhost:5173)
npm run dev

# 3. Gerar a versão de produção (pasta dist/)
npm run build

# 4. Testar a versão de produção localmente (com service worker / offline)
npm run preview
```

Para regerar os ícones do app (fundo azul-marinho com “E52” amarelo): `npm run icons`.

### Publicar no GitHub Pages

O projeto usa `HashRouter` e caminhos relativos (`base: './'`), então basta publicar o conteúdo da pasta `dist/` em qualquer endereço (por exemplo, o branch `gh-pages`).

> ⚠️ A instalação como app e o modo offline exigem **HTTPS** (ou `localhost`).

## 📱 Como instalar o app

### Android (Chrome)
1. Abra o endereço do app no **Chrome**.
2. Toque no menu **⋮** (canto superior direito).
3. Toque em **“Instalar app”** ou **“Adicionar à tela inicial”**.
4. Confirme. O ícone **E52** aparecerá na tela inicial.

### iPhone / iPad (Safari)
1. Abra o endereço do app no **Safari** (precisa ser o Safari).
2. Toque no botão **Compartilhar** (quadrado com seta para cima).
3. Role e toque em **“Adicionar à Tela de Início”**.
4. Toque em **“Adicionar”**.

> No iPhone, os lembretes por notificação só funcionam com o app instalado na Tela de Início (iOS 16.4 ou superior).

### Windows (Edge ou Chrome)
1. Abra o endereço do app no **Microsoft Edge** ou **Google Chrome**.
2. Clique no ícone de **instalar** (⊕ / monitor com seta) na barra de endereço,
   ou no menu **⋯ → Aplicativos → Instalar este site como um aplicativo** (Edge) / **⋮ → Transmitir, salvar e compartilhar → Instalar página como app** (Chrome).
3. Confirme. O app abrirá em janela própria e ficará no Menu Iniciar.

## 💾 Backup

Em **Configurações → Backup do progresso**, use **Exportar** para baixar um arquivo `.json` com todo o seu progresso e **Importar** para restaurá-lo (por exemplo, ao trocar de celular).

## 📂 Estrutura

```
src/
  data/weeks.json        conteúdo das 52 semanas
  data/course.ts         acesso tipado ao conteúdo
  types.ts               tipos TypeScript
  store/useProgress.ts   estado global (Zustand + persist)
  store/useStats.ts      estatísticas derivadas
  lib/progress.ts        cálculos de progresso, streak, gráficos
  lib/srs.ts             repetição espaçada (Leitner)
  lib/tts.ts             leitura em voz alta (Web Speech API)
  lib/achievements.ts    conquistas
  components/            ProgressRing, WeekCard, WordCard, FlipCard, TabBar, Badge, Heatmap…
  pages/                 Home, Weeks, WeekDetail, Flashcards, Quiz, Review, Progress, Settings
public/                  ícones do PWA
scripts/gen-icons.mjs    gerador dos ícones
```

Bons estudos, Ronaldo! 💪
