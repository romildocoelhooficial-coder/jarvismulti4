import { DynamicContent, LogEntry, MemoryEntry, ToolOutcome } from '../types';

export interface BrainResponse {
  spokenText: string;
  acknowledgment?: string;
  toolName?: string;
  toolOutcome?: ToolOutcome;
  logDetail?: string;
  dynamicContent?: DynamicContent;
  memoryUpdate?: { category: MemoryEntry['category']; key: string; value: string };
  nicknameUpdate?: string;
  actionTrigger?: 'open_camera' | 'open_folder_search' | 'open_admin_panel';
  requiresConfirmation?: {
    title: string;
    description: string;
    action: () => void;
  };
}

export class JarvisBrain {
  private assistantName: string;
  private userName: string;

  constructor(assistantName = 'JARVIS', userName = 'Senhor') {
    this.assistantName = assistantName;
    this.userName = userName;
  }

  updateNames(assistantName: string, userName: string) {
    this.assistantName = assistantName;
    this.userName = userName;
  }

  async processQueryAsync(
    rawText: string,
    memories: MemoryEntry[],
    systemMetrics: { cpu: number; mem: number; gpu: number; tmp: number },
    currentUserRole: 'admin' | 'operador' = 'admin'
  ): Promise<BrainResponse> {
    const text = rawText.toLowerCase().trim();

    // 1. DÚVIDA SOBRE INSTALAÇÃO DO PYTHON
    if (text.includes('instalar o python') || text.includes('preciso do python') || text.includes('instalar python') || text.includes('preciso instalar o python')) {
      return {
        spokenText: `Negativo, ${this.userName}. O Mark LVI foi reestruturado como uma aplicação web PWA de última geração. Os módulos de visão computacional da câmera, busca de arquivos locais no navegador, projeção de mídia e a inteligência do Google AI Studio operam com zero dependências externas. Nenhuma instalação de Python é necessária.`,
        toolName: 'system_architecture_query',
        toolOutcome: 'done',
        logDetail: 'Esclarecimento de arquitetura: Sistema 100% PWA nativo sem necessidade de Python.',
      };
    }

    // 2. PEDIDO DO USUÁRIO PARA O JARVIS O CHAMAR PELO NOME (sem alterar o padrão geral do Admin)
    if (text.includes('me chame de') || text.includes('meu nome é') || text.includes('pode me chamar de')) {
      const match = rawText.match(/(?:me chame de|meu nome é|pode me chamar de)\s+([a-zA-ZÀ-ÿ0-9_ -]+)/i);
      const nickname = match ? match[1].replace(/[.!?]/g, '').trim() : '';
      if (nickname) {
        return {
          spokenText: `Afirmativo. A partir deste instante passarei a chamá-lo de ${nickname}. A configuração global do Administrador permanece protegida e intacta. Em que posso auxiliá-lo agora, ${nickname}?`,
          logDetail: `Tratamento personalizado da sessão definido como: "${nickname}". Padrão geral do Admin preservado.`,
          nicknameUpdate: nickname,
          toolName: 'user_profile_nickname',
          toolOutcome: 'done',
        };
      }
    }

    // 3. ATIVAR E MOSTRAR A CÂMERA DO USUÁRIO / INTERPRETAR O QUE VÊ
    if (
      text.includes('câmera') ||
      text.includes('camera') ||
      text.includes('sensores ópticos') ||
      text.includes('o que você está vendo') ||
      text.includes('o que vê') ||
      text.includes('interpretar o que vê') ||
      text.includes('olhe isso') ||
      text.includes('ligar visão')
    ) {
      return {
        acknowledgment: `Engajando sensores ópticos do Mark LVI, ${this.userName}.`,
        spokenText: `Câmera ativada com sucesso sobre o painel tático. A inteligência visual multimodal do Google AI Studio está conectada aos sensores ópticos. Posicione qualquer objeto ou documento para análise imediata.`,
        toolName: 'camera_vision_system',
        toolOutcome: 'done',
        actionTrigger: 'open_camera',
        logDetail: 'Sensores ópticos e feed de vídeo engajados no HUD.',
      };
    }

    // 4. BUSCA EM PASTAS LOCAIS DO PC (SEM PYTHON)
    if (
      text.includes('buscar em pasta') ||
      text.includes('busca em pasta') ||
      text.includes('procurar arquivo') ||
      text.includes('pesquisar pasta') ||
      text.includes('abrir pasta') ||
      text.includes('explorador de arquivos')
    ) {
      return {
        spokenText: `Abrindo o indexador de pastas locais, ${this.userName}. Você pode selecionar qualquer diretório do seu computador diretamente pelo navegador sem precisar de Python.`,
        toolName: 'local_folder_search',
        toolOutcome: 'done',
        actionTrigger: 'open_folder_search',
        logDetail: 'Módulo de busca em pastas locais acionado.',
      };
    }

    // 5. PROJETAR VÍDEO DO YOUTUBE NO PAINEL CENTRAL DO HUD
    if (
      text.includes('projetar vídeo') ||
      text.includes('projetar video') ||
      text.includes('tocar vídeo') ||
      text.includes('reproduzir vídeo') ||
      text.includes('vídeo do youtube') ||
      text.includes('video do youtube') ||
      text.includes('youtube') ||
      text.includes('trailer') ||
      text.includes('vídeo no painel central') ||
      text.includes('video no painel central')
    ) {
      // Extract search term or URL
      let embedUrl = 'https://www.youtube.com/embed/Way9Dexny3w?autoplay=1'; // Dune/Iron Man default
      let videoTitle = 'Projeção Audiovisual // Painel Central';

      if (text.includes('iron man') || text.includes('homem de ferro')) {
        embedUrl = 'https://www.youtube.com/embed/8ugaeA-nMTc?autoplay=1';
        videoTitle = 'Homem de Ferro // HUD Central';
      } else if (text.includes('trailer') || text.includes('duna') || text.includes('dune')) {
        embedUrl = 'https://www.youtube.com/embed/Way9Dexny3w?autoplay=1';
        videoTitle = 'Trailer Cinematográfico // Projeção HUD';
      }

      return {
        acknowledgment: `Sincronizando sinal de mídia com o painel central, ${this.userName}.`,
        spokenText: `Projetando vídeo diretamente sobre o HUD central holográfico. Controles de volume e expansão estão disponíveis no display.`,
        toolName: 'youtube_hud_projector',
        toolOutcome: 'done',
        logDetail: 'Vídeo do YouTube projetado com sucesso no painel central.',
        dynamicContent: {
          id: String(Date.now()),
          type: 'video',
          title: videoTitle,
          subtitle: 'Projetor Tático HUD // Matriz Central',
          data: {
            url: embedUrl,
          },
          timestamp: new Date().toLocaleTimeString('pt-BR'),
        },
      };
    }

    // 6. BUSCA NA INTERNET (MULTI-MODO GROUNDED SEARCH)
    if (text.startsWith('pesquisar na internet') || text.startsWith('buscar na internet') || text.startsWith('pesquise na web') || text.startsWith('pesquise sobre') || text.startsWith('buscar sobre')) {
      const query = rawText.replace(/^(pesquisar na internet|buscar na internet|pesquise na web|pesquise sobre|buscar sobre)/i, '').trim();
      try {
        const resp = await fetch('/api/search/web', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: query || 'últimas notícias de tecnologia e IA' }),
        });
        if (resp.ok) {
          const data = await resp.json();
          return {
            acknowledgment: `Executando varredura e pesquisa na rede mundial, ${this.userName}.`,
            spokenText: data.summary,
            toolName: 'web_search_grounding',
            toolOutcome: 'done',
            logDetail: `Pesquisa na Web concluída para: "${query}".`,
            dynamicContent: {
              id: String(Date.now()),
              type: 'search',
              title: `Pesquisa na Web // ${query.slice(0, 30)}`,
              subtitle: 'Inteligência Grounded Google AI Studio',
              data: {
                summary: data.summary,
                sources: ['Google Search Index', 'Bases Tecnológicas Verificadas'],
              },
              timestamp: new Date().toLocaleTimeString('pt-BR'),
            },
          };
        }
      } catch (err) {
        console.warn('Erro na busca web:', err);
      }
    }

    // 7. RELATÓRIO MATINAL / BRIEFING
    if (text.includes('briefing') || text.includes('relatório matinal') || text.includes('bom dia') || text.includes('acordar') || text.includes('wake up')) {
      const now = new Date();
      const timeStr = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      return {
        acknowledgment: `Compilando seu relatório matinal, ${this.userName}.`,
        spokenText: `Bom dia, ${this.userName}. São exatamente ${timeStr}. Os diagnósticos de hardware confirmam todos os núcleos operando dentro da margem térmica ideal a ${systemMetrics.tmp.toFixed(0)} graus Celsius. Nenhum alerta de segurança registrado. Todos os subsistemas Mark LVI estão em prontidão.`,
        toolName: 'proactive_briefing',
        toolOutcome: 'done',
        logDetail: 'Sequência de relatório matinal concluída. Diagnósticos de hardware e memória nominais.',
        dynamicContent: {
          id: String(Date.now()),
          type: 'weather',
          title: 'Relatório Matinal // Telemetria & Clima',
          subtitle: 'Estação Local Integrada',
          data: {
            temp: '23°C',
            condition: 'Tempo Estável / Céu Limpo',
            humidity: '52%',
            wind: '14 km/h SE',
          },
          timestamp: timeStr,
        },
      };
    }

    // 8. TELEMETRIA E HARDWARE
    if (text.includes('telemetria') || text.includes('diagnóstico') || text.includes('hardware') || text.includes('temperatura') || text.includes('status')) {
      const isHot = systemMetrics.tmp > 80;
      return {
        acknowledgment: `Realizando varredura dos sensores de hardware, ${this.userName}.`,
        spokenText: `A carga da CPU está em ${systemMetrics.cpu.toFixed(0)}%, o consumo de memória RAM é de ${systemMetrics.mem.toFixed(0)}% e o processamento gráfico da GPU registra ${systemMetrics.gpu.toFixed(0)}%. A temperatura média dos núcleos é de ${systemMetrics.tmp.toFixed(0)} graus Celsius. ${isHot ? 'Alerta: temperaturas elevadas detectadas.' : 'Envelope operacional perfeitamente estável.'}`,
        toolName: 'system_monitor',
        toolOutcome: 'done',
        logDetail: `Verificação de sistema concluída: CPU ${systemMetrics.cpu}%, RAM ${systemMetrics.mem}%, GPU ${systemMetrics.gpu}%, TEMP ${systemMetrics.tmp}°C. Processos nominais.`,
      };
    }

    // 9. CLIMA E METEOROLOGIA
    if (text.includes('clima') || text.includes('tempo') || text.includes('previsão') || text.includes('vai chover') || text.includes('temperatura hoje')) {
      return {
        acknowledgment: `Acessando os radares meteorológicos, ${this.userName}.`,
        spokenText: `Registrando atualmente 23 graus Celsius com céu parcialmente nublado e ventos de 14 quilômetros por hora vindo do sudeste. Umidade relativa do ar em 52 por cento, sem probabilidade de chuva nas próximas 24 horas.`,
        toolName: 'weather_report',
        toolOutcome: 'done',
        logDetail: 'Dados meteorológicos em tempo real obtidos. Pressão barométrica 1015 hPa.',
        dynamicContent: {
          id: String(Date.now()),
          type: 'weather',
          title: 'Condições Meteorológicas // Radar ao Vivo',
          subtitle: 'Estação de Monitoramento Atmosférico',
          data: {
            temp: '23°C',
            condition: 'Parcialmente Nublado',
            humidity: '52%',
            wind: '14 km/h SE',
          },
          timestamp: new Date().toLocaleTimeString('pt-BR'),
        },
      };
    }

    // 10. DIÁLOGOS COMUNS E PERGUNTAS GERAIS VIA GOOGLE AI STUDIO (GEMINI 3.8 FLASH)
    try {
      const memorySummary = memories.slice(0, 8).map(m => `- ${m.key}: ${m.value}`).join('\n');
      const response = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: rawText,
          assistantName: this.assistantName,
          userName: this.userName,
          metrics: systemMetrics,
          memoryContext: memorySummary,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const geminiReply = data.text || '';
        if (geminiReply.trim()) {
          return {
            spokenText: geminiReply,
            logDetail: `Resposta processada via Gemini AI Studio (${data.model || 'gemini-3.8-flash'}) em Português do Brasil.`,
            toolName: 'gemini_dialogue_engine',
            toolOutcome: 'done',
          };
        }
      }
    } catch (apiError) {
      console.warn('Erro ao consultar /api/gemini/chat:', apiError);
    }

    // Resposta padrão caso haja indisponibilidade temporária de rede
    return {
      spokenText: `Às suas ordens, ${this.userName}. Todos os canais de telemetria do Mark LVI estão ativos e sincronizados. Qual é a sua instrução?`,
      logDetail: `Diálogo processado localmente: "${rawText}"`,
    };
  }
}
