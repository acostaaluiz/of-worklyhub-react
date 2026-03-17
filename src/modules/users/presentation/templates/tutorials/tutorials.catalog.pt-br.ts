import type { TutorialModuleContent } from "./tutorials.catalog.types";

export const tutorialsCatalogPtBR: TutorialModuleContent[] = [
  {
    id: "billing",
    title: "Faturamento",
    subtitle: "Planos, assinaturas e pagamentos",
    slides: [
      {
        title: "Comece pela landing de Billing",
        summary: "Use a landing de Billing como ponto principal para decisoes de plano e pagamento.",
        bullets: [
          "Na busca do header (`Search modules`), digite `Billing`, abra a landing e escolha `Plans`.",
          "Revise planos recomendados e disponiveis antes de selecionar o upgrade.",
          "Alinhe o escopo do plano com tamanho da equipe, complexidade operacional e fase de crescimento.",
        ],
        expectedResult: "Voce inicia decisoes de faturamento com contexto claro e menos erros.",
      },
      {
        title: "Compare planos com criterio operacional",
        summary: "Avalie cada plano usando necessidades reais da operacao, e nao apenas preco.",
        bullets: [
          "Priorize funcionalidades criticas para o fluxo de entrega atual.",
          "Estime o crescimento de curto prazo para evitar subdimensionamento do plano.",
          "Use custo previsivel versus valor esperado como criterio final de escolha.",
        ],
        expectedResult: "A selecao de plano fica estrategica e reduz retrabalho.",
      },
      {
        title: "Execute checkout com disciplina",
        summary: "Use o Checkout para concluir atualizacoes de cobranca com validacao de pedido e pagamento.",
        bullets: [
          "A partir da landing de Billing, escolha `Checkout` apos confirmar o plano.",
          "Revise resumo do pedido e dados de pagamento antes de confirmar.",
          "Evite envio duplicado aguardando o feedback final de status do checkout.",
        ],
        expectedResult: "O fluxo de pagamento conclui com menor risco de erros de cobranca.",
      },
      {
        title: "Valide ativacao de acesso",
        summary: "Confirme que as mudancas de acesso estao ativas logo apos o checkout.",
        bullets: [
          "Reabra Billing e valide o estado atual do plano apos o pagamento.",
          "Abra o perfil em Users e confirme atualizacao de indicadores de plano e tokens.",
          "Valide que o acesso aos modulos chave reflete o escopo do plano escolhido.",
        ],
        expectedResult: "Sua equipe passa a usar o plano comprado sem lacunas de ativacao.",
      },
      {
        title: "Trate falhas de pagamento sem confusao",
        summary: "Aplique uma rotina simples de contingencia quando checkout ou confirmacao falhar.",
        bullets: [
          "Se o checkout falhar, revise os dados de pagamento e tente novamente uma vez com dados corrigidos.",
          "Atualize o estado de Billing antes de nova tentativa para evitar operacoes duplicadas.",
          "Escalone inconsistencias nao resolvidas com evidencias e horario do incidente.",
        ],
        expectedResult: "Incidentes de pagamento sao resolvidos mais rapido com menor impacto operacional.",
      },
      {
        title: "Rode uma rotina mensal de governanca de billing",
        summary: "Revise aderencia de plano e eficiencia de custo todo mes.",
        bullets: [
          "Verifique se o plano atual ainda corresponde ao uso da equipe e aos objetivos de negocio.",
          "Acompanhe adocao de tokens e features para antecipar upgrades com antecedencia.",
          "Documente decisoes de faturamento e alinhe stakeholders sobre ajustes do proximo ciclo.",
        ],
        expectedResult: "O faturamento fica previsivel e alinhado a um crescimento sustentavel.",
      },
    ],
  },
  {
    id: "clients",
    title: "Clientes",
    subtitle: "Gestao de clientes e relacionamento",
    slides: [
      {
        title: "Monte uma base limpa de clientes",
        summary: "Centralize dados de contato e perfil para apoiar vendas e entrega de servicos.",
        bullets: [
          "Na busca do header (`Search modules`), digite `Clients`, abra a landing e escolha `Services catalog`.",
          "Cadastre dados completos de identificacao do cliente",
          "Mantenha canais de comunicacao atualizados",
          "Segmente clientes por perfil e valor",
        ],
        expectedResult: "Sua equipe trabalha com uma fonte unica de verdade.",
      },
      {
        title: "Melhore a qualidade do follow-up",
        summary: "Transforme registros de clientes em fluxos acionaveis para o time.",
        bullets: [
          "Acompanhe historico de servicos e interacoes",
          "Sinalize clientes prioritarios e problemas em aberto",
          "Defina proximas acoes claras por conta",
        ],
        expectedResult: "Voce melhora retencao e reduz tempo de resposta.",
      },
      {
        title: "Conecte clientes a operacao",
        summary: "Relacione clientes com agenda, ordens de servico e resultados financeiros.",
        bullets: [
          "Associe agendamentos aos registros de clientes",
          "Conecte ordens de servico ao cliente solicitante",
          "Relacione resultados de cobranca ao historico da conta",
        ],
        expectedResult: "Voce ganha visibilidade ponta a ponta da jornada do cliente.",
      },
    ],
  },
  {
    id: "company",
    title: "Empresa",
    subtitle: "Perfil e configuracao do negocio",
    slides: [
      {
        title: "Defina a base do negocio",
        summary: "Configure identidade da empresa e baseline operacional uma vez para reutilizar em todo o sistema.",
        bullets: [
          "Na busca do header (`Search modules`), digite `Company`, abra a landing e escolha `Company setup`.",
          "Mantenha dados legais e comerciais consistentes",
          "Defina atributos centrais do negocio",
          "Mantenha qualidade do perfil para dar clareza ao time",
        ],
        expectedResult: "Sua conta inicia com estrutura consistente.",
      },
      {
        title: "Padronize o contexto de servicos",
        summary: "Use configuracoes da empresa para alinhar linguagem e escopo de servicos entre equipes.",
        bullets: [
          "Defina suas linhas principais de servico",
          "Estabeleca posicionamento claro para a equipe",
          "Documente premissas operacionais de base",
        ],
        expectedResult: "Sua equipe executa com menos ambiguidade.",
      },
      {
        title: "Sustente prontidao para crescimento",
        summary: "Mantenha perfil e setup atualizados conforme a operacao evolui.",
        bullets: [
          "Revise mudancas de perfil mensalmente",
          "Reflita expansao de equipe e escopo rapidamente",
          "Use dados de setup para melhorar relatorios",
        ],
        expectedResult: "Voce evita deriva operacional durante a escalada.",
      },
    ],
  },
  {
    id: "dashboard",
    title: "Dashboard",
    subtitle: "KPIs e insights de negocio",
    slides: [
      {
        title: "Leia o pulso operacional",
        summary: "Use KPIs para entender performance rapidamente.",
        bullets: [
          "Na busca do header (`Search modules`), digite `Dashboard`, abra a landing e escolha `Overview`.",
          "Acompanhe execucao, demanda e throughput",
          "Observe mudancas de tendencia por janelas de tempo",
          "Identifique sinais de risco cedo",
        ],
        expectedResult: "Voce prioriza o que precisa de acao agora.",
      },
      {
        title: "Conduza decisoes diarias",
        summary: "Converta numeros em prioridades praticas para cada dia.",
        bullets: [
          "Revise primeiro os indicadores de maior impacto",
          "Alinhe carga da equipe com gargalos visiveis",
          "Crie loops curtos para acoes corretivas",
        ],
        expectedResult: "Sua operacao reage mais rapido com melhor foco.",
      },
      {
        title: "Alinhe lideranca e execucao",
        summary: "Use KPIs compartilhados para comunicacao consistente entre niveis tatico e estrategico.",
        bullets: [
          "Use as mesmas definicoes entre equipes",
          "Rode rituais recorrentes de revisao de KPI",
          "Conecte acoes dos modulos aos resultados",
        ],
        expectedResult: "Voce melhora responsabilidade e qualidade de execucao.",
      },
    ],
  },
  {
    id: "finance",
    title: "Financeiro",
    subtitle: "Pagamentos, fluxo de caixa e relatorios",
    slides: [
      {
        title: "Comece pelo overview de Finance",
        summary: "Comece pela landing de Finance e abra Overview para ler direcao dos KPIs antes dos detalhes operacionais.",
        bullets: [
          "Na busca do header (`Search modules`), digite `Finance`, abra a landing e escolha `Overview`.",
          "Defina filtros de periodo e agrupamento na tela de overview.",
          "Alterne visualizacoes para comparar cards de overview, servicos, fluxo de caixa e insights.",
          "Valide receita, despesa, lucro e margem antes de agir.",
        ],
        expectedResult: "Sua analise parte de uma base financeira confiavel.",
      },
      {
        title: "Registre transacoes em Entries",
        summary: "Use Entries para manter entradas e saidas alinhadas com a realidade operacional.",
        bullets: [
          "Na landing de Finance, abra `Entries` e crie registros de receita/despesa com descricoes claras.",
          "Revise o historico da lista para confirmar consistencia de valor, tipo e data.",
          "Corrija lancamentos errados rapidamente para evitar distorcao no dashboard.",
        ],
        expectedResult: "Fluxo de caixa e relatorios permanecem confiaveis para decisao.",
      },
      {
        title: "Analise performance de servicos",
        summary: "Use Services performance para identificar quais servicos puxam receita e pressionam margem.",
        bullets: [
          "Na landing de Finance, abra `Services performance` para comparar servicos por resultado financeiro.",
          "Priorize servicos de alto volume ao testar ajustes de preco.",
          "Cruze servicos de baixa margem com complexidade de execucao em work-order.",
        ],
        expectedResult: "Voce foca esforcos de otimizacao onde o impacto e maior.",
      },
      {
        title: "Aplique sugestoes de preco com contexto",
        summary: "Use Suggestions para converter recomendacoes em mudancas de preco controladas.",
        bullets: [
          "Na landing de Finance, abra `Suggestions` e revise a justificativa antes de aplicar.",
          "Use sinais de confianca e impacto para evitar reducoes agressivas de margem.",
          "Aplique mudancas por prioridade e monitore comportamento posterior em entries.",
        ],
        expectedResult: "Ajustes de preco ficam mais seguros e orientados por dados.",
      },
      {
        title: "Transforme insights em fila de acao",
        summary: "Use actionable insights para decidir o que executar primeiro nesta semana.",
        bullets: [
          "No overview de Finance, troque para a visualizacao `Insights` para ver recomendacoes priorizadas.",
          "Converta cada insight em dono e prazo concreto.",
          "Acompanhe se cada acao melhorou margem, caixa ou comportamento de custo.",
        ],
        expectedResult: "Insights deixam de ser relatorio estatico e viram tarefas executaveis.",
      },
      {
        title: "Rode um ritual semanal de financeiro",
        summary: "Feche o ciclo com modulos de work-order, schedule e growth toda semana.",
        bullets: [
          "Compare riscos de caixa com trabalhos pendentes em Work order e Schedule.",
          "Alinhe decisoes de campanha em Growth com margem e capacidade disponiveis.",
          "Documente decisoes e revisite movimento de tendencia dos KPIs no ciclo seguinte.",
        ],
        expectedResult: "Financeiro vira um sistema de direcao para os demais modulos.",
      },
    ],
  },
  {
    id: "growth",
    title: "Crescimento",
    subtitle: "Retencao, reativacao e recuperacao de receita",
    slides: [
      {
        title: "Abra o Growth Autopilot como seu quadro de execucao",
        summary: "Comece pela landing de Growth e abra Growth autopilot para centralizar sinais operacionais.",
        bullets: [
          "Na busca do header (`Search modules`), digite `Growth`, abra a landing e escolha `Growth autopilot`.",
          "Confirme oportunidades, playbooks e tags de origem na secao principal.",
          "Use este quadro como ponto padrao para planejar acoes de retencao e reativacao.",
          "Atualize os dados antes do disparo para evitar atuar sobre status desatualizado.",
        ],
        expectedResult: "Sua equipe trabalha com uma unica fila priorizada de crescimento.",
      },
      {
        title: "Priorize oportunidades antes do disparo",
        summary: "Use a aba Opportunities para filtrar, selecionar e disparar apenas oportunidades de alto impacto.",
        bullets: [
          "Em `Opportunities`, filtre por status e modulo de origem para reduzir ruido.",
          "Use busca para localizar clientes especificos antes de disparar campanhas.",
          "Selecione oportunidades em lote e dispare com um playbook habilitado.",
        ],
        expectedResult: "O volume de disparo cresce sem perder qualidade de priorizacao.",
      },
      {
        title: "Configure playbooks por objetivo",
        summary: "Defina metas, canais e cadencia em Playbooks para campanhas repetiveis.",
        bullets: [
          "No Growth autopilot, mude para a aba `Playbooks` para configurar logica de retencao, upsell e recuperacao.",
          "Defina canais (WhatsApp, email, SMS), atraso e maximo de toques por playbook.",
          "Mantenha habilitados apenas playbooks de alta qualidade para evitar baixa conversao.",
        ],
        expectedResult: "A execucao de campanhas fica padronizada e mais escalavel.",
      },
      {
        title: "Meça impacto em Attribution",
        summary: "Use Attribution para validar desempenho de disparo e recuperacao de receita.",
        bullets: [
          "No Growth autopilot, mude para a aba `Attribution` para monitorar enviados, convertidos e receita recuperada.",
          "Revise taxa de conversao e mix de pipeline antes de mudar regras de playbook.",
          "Acompanhe tempo medio de recuperacao para melhorar decisoes de cadencia.",
        ],
        expectedResult: "Voce otimiza taticas de crescimento com feedback mensuravel.",
      },
      {
        title: "Use contexto entre modulos antes de contatar clientes",
        summary: "Valide contexto de cliente e operacao para evitar campanhas genericas ou mal sincronizadas.",
        bullets: [
          "Use a busca do header para abrir a landing de `Clients` e depois `Client 360` para contexto de relacionamento.",
          "Use a busca do header para abrir as landings de `Schedule` e `Work order` antes de revisar os menus de execucao.",
          "Valide relevancia financeira no overview de Finance antes de priorizar upsell ou recuperacao.",
        ],
        expectedResult: "Campanhas ficam mais relevantes e melhoram qualidade de conversao.",
      },
      {
        title: "Rode um ciclo semanal de revisao de growth",
        summary: "Crie um processo repetivel para atualizar pipeline, playbooks e metas de atribuicao.",
        bullets: [
          "Comece por Opportunities, depois ajuste Playbooks e feche com resultados de Attribution.",
          "Defina limites de taxa de conversao e receita recuperada por periodo.",
          "Registre aprendizados e aplique ajustes no ciclo seguinte.",
        ],
        expectedResult: "A performance de crescimento evolui com cadencia consistente.",
      },
    ],
  },
  {
    id: "inventory",
    title: "Estoque",
    subtitle: "Controle de estoque e insumos",
    slides: [
      {
        title: "Estruture seu estoque",
        summary: "Crie um catalogo limpo com semantica de estoque confiavel para a equipe.",
        bullets: [
          "Na busca do header (`Search modules`), digite `Inventory`, abra a landing e escolha `Stock items`.",
          "Cadastre itens com identificadores claros",
          "Defina categorias e locais de estoque",
          "Mantenha niveis minimos atualizados",
        ],
        expectedResult: "Sua base de estoque se torna confiavel.",
      },
      {
        title: "Gerencie produtos como catalogo operacional",
        summary: "Use a aba Products para manter qualidade e acionabilidade dos itens.",
        bullets: [
          "Crie e edite produtos com SKU, categoria, estoque e estoque minimo.",
          "Use acoes de entrada/saida direto na linha do produto para correcoes rapidas.",
          "Controle itens inativos ou obsoletos para evitar ruido em relatorios.",
        ],
        expectedResult: "A qualidade do catalogo melhora e erros operacionais diminuem.",
      },
      {
        title: "Acompanhe indicadores e alertas criticos",
        summary: "Use abas de indicadores e alertas para prevenir rupturas de estoque.",
        bullets: [
          "Monitore indicadores de baixo estoque, ruptura e valor total em estoque.",
          "Revise alertas operacionais por severidade para priorizar resposta.",
          "Use sugestoes de compra para planejar reposicao antes que falte material.",
        ],
        expectedResult: "Voce reduz faltas e melhora o tempo de reposicao.",
      },
      {
        title: "Use o movement ledger para auditoria",
        summary: "Inspecione historico de movimentacoes para validar mudancas de quantidade e causa raiz.",
        bullets: [
          "Abra Movement Ledger e revise janelas de data para atividade recente.",
          "Cheque direcao, origem, saldo e motivo de cada movimentacao.",
          "Use evidencias do ledger para corrigir gaps de processo e rastreabilidade.",
        ],
        expectedResult: "O controle de estoque fica auditavel e facil de governar.",
      },
      {
        title: "Organize categorias e padrao de nomenclatura",
        summary: "Use Categories para manter consistencia de agrupamento e relatorios.",
        bullets: [
          "Na landing de Inventory, abra `Categories` para criar e manter taxonomia.",
          "Aplique padrao de nomes para classificacao consistente entre equipes.",
          "Desative categorias com cuidado para evitar contexto orfao em produtos.",
        ],
        expectedResult: "A consistencia de classificacao melhora analytics e execucao diaria.",
      },
      {
        title: "Configure politicas em Inventory settings",
        summary: "Defina padroes e regras de validacao do workspace uma unica vez para todos os usuarios.",
        bullets: [
          "Na landing de Inventory, abra `Settings` para configurar campos obrigatorios e valores padrao.",
          "Ajuste politica de movimentacao e limites de alerta conforme a realidade da operacao.",
          "Revise configuracoes apos mudancas de processo para manter comportamento consistente.",
        ],
        expectedResult: "A operacao de estoque escala com menos correcoes manuais.",
      },
      {
        title: "Conecte estoque com execucao e financeiro",
        summary: "Use contexto entre modulos para transformar dados de estoque em protecao de margem.",
        bullets: [
          "Cruze itens de alto consumo com padroes de execucao no Work order.",
          "Valide impacto de consumo contra tendencias de Finance antes de alterar precificacao.",
          "Use ciclos semanais de revisao para refinar reposicao e disciplina de uso.",
        ],
        expectedResult: "Decisoes de estoque protegem continuidade de servico e lucratividade.",
      },
    ],
  },
  {
    id: "people",
    title: "Pessoas",
    subtitle: "Capacidade e disponibilidade da equipe",
    slides: [
      {
        title: "Defina disponibilidade semanal",
        summary: "Configure baseline semanal de capacidade para cada colaborador em um fluxo unico.",
        bullets: [
          "Na busca do header (`Search modules`), digite `People`, abra a landing e escolha `Team`.",
          "Abra People e use a aba Capacity & availability",
          "Defina minutos por dia util para cada colaborador",
          "Salve uma vez e mantenha persistencia para visibilidade multiusuario",
        ],
        expectedResult: "Sua equipe trabalha com uma fonte unica de disponibilidade.",
      },
      {
        title: "Registre bloqueios de disponibilidade",
        summary: "Capture excecoes como ferias, treinamento e reunioes para evitar planejamento irreal.",
        bullets: [
          "Crie blocos de data e horario direto no painel de capacidade",
          "Use bloqueios para reduzir automaticamente a disponibilidade diaria efetiva",
          "Mantenha atualizacoes visiveis para gestores e auditoria",
        ],
        expectedResult: "A carga planejada reflete horas realmente disponiveis.",
      },
      {
        title: "Monitore carga e sobrealocacao",
        summary: "Revise indicadores operacionais e carga por colaborador antes que conflitos escalem.",
        bullets: [
          "Monitore taxa de conflito, horas produtivas e carga planejada",
          "Compare carga de schedule e work-order por colaborador",
          "Aja sobre alertas de sobrealocacao antes de despachar novo trabalho",
        ],
        expectedResult: "Voce reduz conflitos de agenda e melhora planejamento de produtividade.",
      },
    ],
  },
  {
    id: "sla",
    title: "SLA",
    subtitle: "Acordos de nivel de servico e metas",
    slides: [
      {
        title: "Comece da landing de Company para a visao de SLA",
        summary: "Use o relatorio de SLA como visao estruturada da carga concluida do schedule.",
        bullets: [
          "Na busca do header (`Search modules`), digite `Company`, abra a landing e escolha `SLAs`.",
          "Use este relatorio para revisar output de SLA por colaborador no periodo selecionado.",
          "Trate SLA como rotina operacional de monitoramento, nao apenas relatorio mensal.",
        ],
        expectedResult: "Voce estabelece um ponto de partida confiavel para governanca de SLA.",
      },
      {
        title: "Aplique filtros com intencao",
        summary: "Use filtros de colaborador e data para isolar padroes de SLA acionaveis.",
        bullets: [
          "Escolha escopo por colaborador ao validar consistencia individual de execucao.",
          "Defina janelas de data alinhadas com sua cadencia de revisao.",
          "Use Apply e Reset para comparar cenarios rapidamente.",
        ],
        expectedResult: "A analise de SLA fica focada e mais facil de executar.",
      },
      {
        title: "Interprete a tabela alem dos totais",
        summary: "Use entradas por dia, horas totais e distribuicao por colaborador para achar anomalias.",
        bullets: [
          "Revise concentracao por data e colaborador para identificar periodos de sobrecarga.",
          "Compare horas totais entre periodos para detectar mudancas bruscas de execucao.",
          "Use estados vazios como sinal para validar filtros e completude do fluxo.",
        ],
        expectedResult: "Voce extrai insights prontos para decisao, nao apenas numeros crus.",
      },
      {
        title: "Conecte performance de SLA a causa raiz",
        summary: "Investigue fatores de outros modulos por tras de deterioracao ou volatilidade de SLA.",
        bullets: [
          "Abra o modulo Schedule para inspecionar conclusao e pressao na linha do tempo.",
          "Abra Work order para avaliar fila, prioridade e concentracao de atrasos.",
          "Abra People para validar restricoes de capacidade e alocacao.",
        ],
        expectedResult: "Voce sai do sintoma e chega na resolucao de causa raiz.",
      },
      {
        title: "Desenhe acoes corretivas por cluster de colaboradores",
        summary: "Priorize intervencoes onde a variancia de SLA for maior.",
        bullets: [
          "Agrupe colaboradores por padrao estavel, em melhora e em risco.",
          "Defina acoes focadas: treinamento, realocacao ou simplificacao de processo.",
          "Acompanhe movimento pos-acao no proximo ciclo de relatorio.",
        ],
        expectedResult: "Acoes de melhoria de SLA ficam mensuraveis e direcionadas.",
      },
      {
        title: "Rode um ritual semanal de revisao de SLA",
        summary: "Crie uma cadencia leve para evitar deriva de SLA.",
        bullets: [
          "Revise relatorio de SLA com lideranca e operacao em checkpoints semanais fixos.",
          "Registre principais riscos, donos e prazos de cada acao corretiva.",
          "Revisite resultados no ciclo seguinte e ajuste padroes progressivamente.",
        ],
        expectedResult: "O controle de SLA fica continuo, consistente e auditavel.",
      },
    ],
  },
  {
    id: "schedule",
    title: "Agenda",
    subtitle: "Agendamentos e planejamento de calendario",
    slides: [
      {
        title: "Comece pelo calendario operacional",
        summary: "Comece pela landing de Schedule e use Calendar como fonte de verdade dos agendamentos.",
        bullets: [
          "Na busca do header (`Search modules`), digite `Schedule`, abra a landing e escolha `Calendar`.",
          "Escolha a visualizacao de calendario adequada ao horizonte de planejamento.",
          "Revise painel lateral e proximos eventos antes de criar novos agendamentos.",
          "Valide carga de hoje para evitar conflitos de capacidade ocultos.",
        ],
        expectedResult: "Voce inicia o planejamento com uma agenda realista e compartilhada.",
      },
      {
        title: "Crie eventos com contexto completo",
        summary: "Use o modal de evento para registrar todos os campos criticos antes de confirmar.",
        bullets: [
          "Defina titulo claro, janela de horario e contexto de servico ao criar o agendamento.",
          "Atribua colaboradores e inclua detalhes necessarios para handoff de execucao.",
          "Use descricao e campos adicionais para reduzir comunicacao de ida e volta.",
        ],
        expectedResult: "Agendamentos ficam acionaveis e mais faceis de executar.",
      },
      {
        title: "Gerencie remarcacoes e transicoes de status",
        summary: "Mantenha qualidade da agenda alta quando o plano mudar durante o dia.",
        bullets: [
          "Atualize horarios rapidamente quando cliente ou equipe pedir alteracao.",
          "Use atualizacoes de status para refletir progresso real de execucao no calendario.",
          "Evite slots duplicados ou obsoletos limpando eventos invalidados imediatamente.",
        ],
        expectedResult: "O calendario permanece confiavel sob variabilidade operacional.",
      },
      {
        title: "Configure padroes em Schedule settings",
        summary: "Defina comportamento do modulo uma vez para manter consistencia na criacao de eventos.",
        bullets: [
          "Na landing de Schedule, abra `Settings` para configurar defaults e regras de validacao.",
          "Defina campos obrigatorios para confirmar um agendamento.",
          "Revise defaults apos mudancas de processo para manter alinhamento da equipe.",
        ],
        expectedResult: "A qualidade dos eventos melhora sem supervisao extra.",
      },
      {
        title: "Conecte agenda com execucao do trabalho",
        summary: "Ligue agendamentos com entrega e resultado financeiro.",
        bullets: [
          "Use a busca do header para abrir `Work order` e depois `Work orders` para acompanhar ciclo de execucao.",
          "Use a busca do header para abrir `People` e depois `Team` antes de confirmar dias de alta carga.",
          "Use a busca do header para abrir `Finance` e depois `Overview` para refinar planejamento.",
        ],
        expectedResult: "Planejamento e execucao passam a ser um fluxo continuo.",
      },
      {
        title: "Adote um ritual diario de revisao do calendario",
        summary: "Use uma cadencia fixa de revisao para evitar atrasos em cascata.",
        bullets: [
          "Rode revisao no inicio do dia para conflitos, prioridades e informacoes faltantes.",
          "Rode revisao no fim do dia para limpar backlog e replanejar itens bloqueados.",
          "Acompanhe gargalos recorrentes e ajuste regras de agendamento proativamente.",
        ],
        expectedResult: "Voce reduz no-shows, retrabalho e urgencias no fim do dia.",
      },
    ],
  },
  {
    id: "services",
    title: "Servicos",
    subtitle: "Catalogo e precificacao",
    slides: [
      {
        title: "Monte um catalogo estruturado",
        summary: "Defina servicos com escopo claro, preco e premissas de duracao.",
        bullets: [
          "Na busca do header (`Search modules`), digite `Company`, abra a landing e escolha `Services`.",
          "Padronize nomes e categorias de servico",
          "Defina referencias de preco e esforco",
          "Mantenha ofertas ativas curadas",
        ],
        expectedResult: "Times comercial e operacional ficam alinhados.",
      },
      {
        title: "Proteja margem com consistencia",
        summary: "Use qualidade de catalogo para evitar subprecificacao e deriva de escopo.",
        bullets: [
          "Revise regularmente custo de entrega versus preco",
          "Documente claramente adicionais e trabalho opcional",
          "Atualize o catalogo com base em dados reais de execucao",
        ],
        expectedResult: "Voce melhora desempenho financeiro por servico.",
      },
      {
        title: "Use o catalogo como motor de decisao",
        summary: "Conecte servicos aos modulos de financeiro, agenda e work order.",
        bullets: [
          "Meça impacto do mix de servicos na receita",
          "Planeje capacidade com base na demanda de servicos",
          "Ajuste portfolio conforme resposta do mercado",
        ],
        expectedResult: "Sua estrategia de servicos fica orientada por dados.",
      },
    ],
  },
  {
    id: "work-order",
    title: "Ordem de servico",
    subtitle: "Ciclo de execucao e controles",
    slides: [
      {
        title: "Comece pelo quadro de execucao de Work Orders",
        summary: "Comece pela landing de Work order e use Work orders para filtrar backlog e priorizar execucao.",
        bullets: [
          "Na busca do header (`Search modules`), digite `Work order`, abra a landing e escolha `Work orders`.",
          "Use filtros de busca, risco, status, prioridade e data no quadro de execucao.",
          "Revise abas `Work orders` e `Operations overview` antes de despachar novo trabalho.",
          "Use Refresh e Reset para manter decisoes de fila com dados atuais.",
        ],
        expectedResult: "Voce prioriza fila com melhor clareza operacional.",
      },
      {
        title: "Crie e edite no modal de Work Order",
        summary: "Use acao New work order ou clique na linha para abrir o modal completo de edicao.",
        bullets: [
          "Clique em `New work order` para criar uma nova ordem do zero.",
          "Clique em qualquer linha existente para abrir o mesmo modal em modo de edicao.",
          "Use Clear e Close com cuidado para nao manter rascunhos antigos.",
        ],
        expectedResult: "Criacao e edicao de ordens ficam mais rapidas e padronizadas.",
      },
      {
        title: "Preencha a aba General com o essencial de execucao",
        summary: "Garanta campos centrais completos antes de alocar pessoas e custos.",
        bullets: [
          "Preencha title, description, priority, status, requester e metadata JSON.",
          "Defina prazos realistas para evitar pressao de SLA oculta depois.",
          "Confirme status e requester antes de salvar.",
        ],
        expectedResult: "Cada ordem de servico fica com baseline limpo para passos seguintes.",
      },
      {
        title: "Atribua equipe e linhas de servico/estoque",
        summary: "Use abas Team e Lines para definir quem executa e o que sera consumido.",
        bullets: [
          "Em `Team`, atribua colaboradores, papeis e minutos alocados.",
          "Em `Lines`, adicione linhas de servico e de estoque com quantidades e valores.",
          "Remova linhas erradas cedo para manter calculos de custo e esforco confiaveis.",
        ],
        expectedResult: "Capacidade de execucao e estrutura de custo ficam explicitas por ordem.",
      },
      {
        title: "Use acoes avancadas no cabecalho do editor",
        summary: "Gerencie artefatos de apoio e controles de automacao direto no modal.",
        bullets: [
          "Use `Attachments` apos o primeiro save para enviar evidencias.",
          "Abra `Finance entries` ao vincular execucao com registros de cobranca.",
          "Abra `Billing settings` quando precisar ajustar comportamento de automacao.",
        ],
        expectedResult: "Rastros operacionais, documentais e financeiros ficam conectados.",
      },
      {
        title: "Configure workflow e guardrails",
        summary: "Mantenha modelo de status e configuracoes do modulo para seguir o mesmo ciclo de vida.",
        bullets: [
          "Na landing de Work order, abra `Statuses` para criar e ordenar etapas de workflow.",
          "Na landing de Work order, abra `Settings` para revisar regras de automacao e validacao.",
          "Alinhe status terminais com automacao financeira para evitar acoes duplicadas.",
        ],
        expectedResult: "Transicoes de status ficam previsiveis e auditaveis.",
      },
      {
        title: "Monitore execucao na timeline e no overview",
        summary: "Acompanhe risco de entrega continuamente via calendario e resumos operacionais.",
        bullets: [
          "Na landing de Work order, abra `Calendar` para visualizar distribuicao de carga no tempo.",
          "Use `Operations overview` para monitorar sinais de vencimento proximo, atraso e conclusao.",
          "Rode ciclo diario de revisao para rebalancear prioridade antes de escalar atrasos.",
        ],
        expectedResult: "Voce reduz prazos perdidos e melhora disciplina de conclusao.",
      },
    ],
  },
];
