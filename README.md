# Rambo Prev - Sistema de Gestão Jurídica

O **Rambo Prev** é um sistema completo de gestão para escritórios de advocacia, com foco especializado em Direito Previdenciário. A aplicação utiliza uma metodologia **Kanban** avançada para rastrear o ciclo de vida dos processos, desde a triagem administrativa até a fase judicial e recursal.

## 🚀 Visão Geral

O sistema foi projetado para aumentar a produtividade e a organização do escritório, eliminando planilhas e controles manuais. Ele centraliza cadastro de clientes, controle de prazos, geração de documentos e comunicação via WhatsApp em uma interface única e intuitiva.

## ✨ Funcionalidades Principais

### 1. Gestão Visual (Kanban)
*   **Múltiplos Fluxos**: Vistas dedicadas para Administrativo, Auxílio-Doença, Recurso Administrativo, Judicial e Mesa de Decisão.
*   **Drag & Drop Inteligente**: Arraste cartões entre colunas. O sistema detecta o movimento e solicita informações contextuais (ex: ao mover para "Protocolado", pede o número do protocolo e data).
*   **Zonas de Ação**: Área lateral para ações rápidas como "Judicializar", "Arquivar" ou "Enviar para Recurso".

### 2. Automação e Inteligência
*   **Previsão de Conclusão**: Algoritmo que estima a data de conclusão baseada no histórico do escritório.
*   **Detecção de Prazos**: Alertas visuais para prazos fatais e perícias próximas.
*   **Transições Lógicas**: Regras de negócio embutidas (ex: se um benefício é indeferido, sugere automaticamente o prazo recursal de 30 dias).

### 3. Gerador de Documentos Profissional
*   **Editor Rich Text**: Editor completo com suporte a formatação (negrito, itálico), alinhamento e listas.
*   **Tabelas e Imagens**: Suporte para inserção e edição de tabelas dinâmicas e upload de imagens (ou inserção via URL).
*   **Variáveis Inteligentes**: Preenchimento automático de dados (ex: `{NOME_CLIENTE}`, `{CPF}`, `{ENDERECO_COMPLETO}`) com base na ficha do cliente.
*   **Logo do Escritório**: Inserção automática da logomarca configurada nas configurações.
*   **Modelos Personalizáveis**: Crie e salve seus próprios modelos de Procuração, Contratos e Declarações.

### 4. Gestão de Clientes e Processos
*   **Ficha Completa**: Dados pessoais, endereço (com busca de CEP), senhas (Gov.br) e histórico de contatos.
*   **Linha do Tempo**: Visualização gráfica do progresso do processo (estilo "metrô").
*   **Anexos e Pendências**: Upload de arquivos e checklist de documentos pendentes.
*   **Histórico de Auditoria**: Log completo de todas as ações realizadas no processo (quem fez, quando e o quê).

### 5. Ferramentas Integradas
*   **Integração WhatsApp**: Envio de mensagens pré-formatadas (cobrança de docs, aviso de perícia, felicitações) com um clique.
*   **Central de Tarefas**: Gestão de pendências da equipe com filtros por prioridade.
*   **Dashboard (BI)**: Gráficos de carga de trabalho, taxa de êxito, aniversariantes do dia e processos estagnados.
*   **Agenda/Calendário**: Visualização mensal de prazos, perícias e datas de cessação (DCB).

### 6. Configurações e Segurança
*   **Gestão de Equipe**: Cadastro de usuários (Advogados, Secretaria, Financeiro) com cores de identificação.
*   **Dados do Escritório**: Configuração de nome, endereço, OAB e **Upload de Logotipo**.
*   **Backup e Restauração**: Exportação completa dos dados em JSON (criptografado localmente) ou CSV para Excel. O sistema roda 100% no navegador (LocalStorage) garantindo privacidade e velocidade.

## 🛠️ Tecnologias Utilizadas

*   **Frontend**: React 18, TypeScript.
*   **Estilização**: Tailwind CSS (Design responsivo e moderno).
*   **Ícones**: Lucide React.
*   **Persistência**: LocalStorage (Simulação de banco de dados no navegador).
*   **Performance**: React.lazy para carregamento sob demanda (Code splitting) e otimizações de renderização.

## 📂 Estrutura do Projeto

```
/
├── components/          # Componentes da UI
├── hooks/               # Custom Hooks (useKanban, useIsMobile)
├── types.ts             # Definições de Tipos TypeScript
├── constants.ts         # Configurações estáticas (Cores, Regras, Modelos Padrão)
├── utils.ts             # Funções auxiliares (Datas, Validação CPF, Exportação)
├── App.tsx              # Componente Raiz e Roteamento Lógico
├── index.tsx            # Ponto de entrada
├── Dockerfile           # Configuração de Build para Container
└── nginx.conf           # Configuração do Servidor Web para Produção
```

## ☁️ Deploy no Google Cloud Run

O projeto está configurado para deploy via container Docker.

### Pré-requisitos
1.  Conta no Google Cloud Platform.
2.  Projeto criado e Cloud Run habilitado.

### Passos Automáticos (AI Studio)
1.  Clique no botão **"Deploy App"**.
2.  Selecione seu projeto do Google Cloud.
3.  Aguarde a construção e implantação do container.

### Como funciona o Deploy?
O `Dockerfile` executa um processo em dois estágios:
1.  **Build**: Compila o código React/TypeScript usando Node.js, gerando arquivos estáticos otimizados na pasta `dist`.
2.  **Serve**: Copia os arquivos estáticos para um servidor Nginx leve, configurado via `nginx.conf` para lidar com rotas de Single Page Application (SPA) e escutar na porta 8080 (padrão do Cloud Run).

---

**Desenvolvido para alta performance e usabilidade jurídica.**