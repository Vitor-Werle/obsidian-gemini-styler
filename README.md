# 🪄 Gemini Document Styler for Obsidian

[![Obsidian](https://img.shields.io/badge/Obsidian-Plugin-blueviolet?style=for-the-badge&logo=obsidian)](https://obsidian.md)
[![Google Gemini](https://img.shields.io/badge/Google-Gemini_AI-4285F4?style=for-the-badge&logo=google)](https://aistudio.google.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](LICENSE)

O **Gemini Document Styler** é um plugin para o [Obsidian](https://obsidian.md) que reestrutura, organiza e embeleza suas notas Markdown instantaneamente através da API oficial do **Google Gemini** (usando a cota 100% gratuita do Google AI Studio).

Com um único comando ou atalho de teclado, transforme rascunhos desorganizados em documentos claros e profissionais — **sem perder seus links, tags ou metadados YAML!**

---

## ⚡ Principais Recursos

- 🎯 **Preservação Total da Sintaxe Obsidian**:
  - **Frontmatter / YAML (`--- ... ---`)**: Metadados, aliases e tags de propriedades são mantidos intactos.
  - **Wikilinks**: Suas conexões de grafo como `[[Nome da Nota]]` e `[[Nota|Apelido]]` continuam funcionando perfeitamente.
  - **Tags e Chamadas**: Mantém `#tags`, callouts (`> [!NOTE]`, `> [!TIP]`, etc.), blocos de código e fórmulas LaTeX (`$...$`).
- 🎨 **5 Perfis de Estilo Prontos + Customizável**:
  1. **Limpo & Estruturado**: Títulos bem divididos (H1/H2/H3), tópicos organizados, tabelas e destaques essenciais em negrito.
  2. **Notas de Estudo & Callouts**: Didático e visual, adicionando callouts de resumo (`> [!summary]`), dicas (`> [!tip]`) e alertas de memorização.
  3. **Acadêmico & Formal**: Parágrafos cultos, citações organizadas e linguagem impessoal e sóbria.
  4. **Resumo Executivo / Síntese**: Direto ao ponto, com tópicos concisos, conclusões e próximos passos.
  5. **Personalizado**: Você define instruções próprias nas configurações.
- ⚡ **Seleção ao Vivo**: Escolha o estilo na hora através de um menu rápido flutuante (`FuzzySuggestModal`).
- ✂️ **Nota Inteira ou Apenas Seleção**: Formate todo o documento ou apenas o parágrafo que você selecionou com o cursor.
- 🔄 **Descoberta Automática de Modelos**: O botão *"Buscar da Minha Conta"* consulta a API do Google e lista automaticamente os modelos disponíveis para a sua chave (`gemini-2.5-flash`, `gemini-2.5-pro`, etc.).
- ↩️ **Compatível com `Ctrl + Z`**: Toda substituição é atômica no editor do Obsidian. Se não gostar do resultado, basta desfazer com `Ctrl + Z`.
- 🔒 **Privacidade e Segurança**: Comunicação direta HTTPS entre seu computador e o Google. Nenhum dado passa por servidores intermediários.

---

## 📥 Como Instalar

### Opção 1: Instalação Manual (Rápida)

1. Baixe os 3 arquivos essenciais da última versão (ou da raiz deste repositório):
   - `main.js`
   - `manifest.json`
   - `styles.css`
2. No seu computador, abra a pasta do seu cofre (Vault) do Obsidian e navegue até a pasta oculta de plugins:
   ```text
   <Seu_Vault>/.obsidian/plugins/
   ```
3. Crie uma pasta chamada `obsidian-gemini-styler`:
   ```text
   <Seu_Vault>/.obsidian/plugins/obsidian-gemini-styler/
   ```
4. Cole os 3 arquivos dentro dessa pasta.
5. No Obsidian, vá em **Configurações > Plugins da Comunidade**:
   - Clique no ícone de recarregar.
   - Ative o **Gemini Document Styler**.

---

### Opção 2: Pelo Plugin BRAT (Beta Reviewers Auto-update Tester)

Se você utiliza o plugin **BRAT** no Obsidian:
1. Abra a paleta de comandos (`Ctrl + P` ou `Cmd + P`).
2. Digite: `BRAT: Add a beta plugin for testing`.
3. Cole a URL deste repositório no GitHub (ex: `https://github.com/SEU_USUARIO/obsidian-gemini-styler`).
4. O BRAT baixará e manterá o plugin atualizado automaticamente!

---

## 🔑 Como Obter sua Chave de API do Gemini (Gratuita)

O Google AI Studio oferece acesso gratuito permanente aos modelos Gemini para uso pessoal:

1. Acesse o [Google AI Studio](https://aistudio.google.com/app/apikey).
2. Faça login com sua conta Google.
3. Clique em **Create API Key** (Criar chave de API) e copie a chave gerada.
4. No Obsidian, abra **Configurações > Gemini Document Styler**.
5. Cole a chave no campo correspondente e clique no botão **Testar Conexão**.
6. *(Opcional)* Clique em **🔄 Buscar da Minha Conta** para carregar os modelos mais recentes liberados para você.

---

## 🚀 Como Usar no Dia a Dia

### 1. Pela Paleta de Comandos (`Ctrl + P` ou `Cmd + P`)
Com qualquer nota aberta, abra a paleta e digite `Gemini`:
- `Gemini Styler: Estilizar nota inteira (perfil padrão)`: Formata a nota inteira com o perfil configurado.
- `Gemini Styler: Estilizar texto selecionado (perfil padrão)`: Formata somente o trecho que você destacou.
- `Gemini Styler: Escolher perfil e estilizar nota inteira`: Abre um menu rápido para escolher o estilo desejado na hora.
- `Gemini Styler: Escolher perfil e estilizar seleção`: Escolhe o estilo e aplica apenas no trecho selecionado.

### 2. Pelo Ícone na Barra Lateral (Ribbon)
Clique no ícone de varinha mágica/brilho (`sparkles`) na barra lateral esquerda para estilizar a nota ativa instantaneamente.

### 3. Criando Atalhos de Teclado Personalizados
1. No Obsidian, abra **Configurações > Atalhos** (Hotkeys).
2. No campo de busca, digite `Gemini Styler`.
3. Clique no ícone de teclado ao lado do comando que mais utiliza (ex: `Estilizar nota inteira` ou `Escolher perfil`).
4. Pressione as teclas desejadas (sugestão: `Alt + G` ou `Ctrl + Shift + G`).

---

## ⚙️ Opções de Configuração

| Configuração | Descrição |
| :--- | :--- |
| **Chave da API** | Sua chave privada do Google AI Studio (armazenada apenas localmente no cofre). |
| **Modelo do Gemini** | Escolha entre `gemini-2.5-flash` (recomendado), `gemini-2.5-pro` ou carregue os da sua conta. |
| **Perfil Padrão** | O estilo que será aplicado por padrão quando acionado via atalho direto. |
| **Instruções Adicionais** | Regras extras que você deseja que a IA siga em toda formatação. |
| **Preservar Frontmatter** | Mantém intacto o cabeçalho YAML (`--- ... ---`) no topo do arquivo. |
| **Temperatura** | Define a criatividade da IA (0.1 para máxima fidelidade estrutural; valores maiores para maior reformulação). |

---

## 🔒 Privacidade & Segurança

- **Zero Servidores Intermediários**: As requisições saem diretamente do seu aplicativo Obsidian via HTTPS para a API oficial do Google Cloud (`generativelanguage.googleapis.com`).
- **Chave Segura**: Sua chave de API fica armazenada exclusivamente no seu próprio computador (no arquivo local `.obsidian/plugins/obsidian-gemini-styler/data.json` do seu cofre) e nunca é enviada para repositórios ou terceiros.

---

## 🛠️ Desenvolvimento e Contribuição

Caso queira clonar o repositório e modificar o código:

```bash
# 1. Clone o repositório
git clone https://github.com/SEU_USUARIO/obsidian-gemini-styler.git
cd obsidian-gemini-styler

# 2. Instale as dependências
npm install

# 3. Compile em modo desenvolvimento (recompilação contínua)
npm run dev

# 4. Compile para distribuição/produção
npm run build
```

---

## 📄 Licença

Este projeto está sob a licença [MIT](LICENSE). Sinta-se livre para usar, estudar e modificar.
