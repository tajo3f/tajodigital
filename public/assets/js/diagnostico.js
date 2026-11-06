/* RAIO-X Digital T3F — client-side only; no telemetry, tracking, or automatic submission. */
(() => {
  'use strict';
  const questions = [
    { topic:'PRESENÇA DIGITAL', title:'Sua empresa tem um site próprio?', help:'Considere um site da empresa, não apenas o perfil em uma rede social.', options:[
      {label:'Sim, e está atualizado', scores:{}},
      {label:'Sim, mas precisa de melhorias', scores:{site:2}},
      {label:'Não temos site próprio', scores:{site:3}} ]},
    { topic:'INFORMAÇÕES DO NEGÓCIO', title:'Como um novo cliente conhece seus produtos ou serviços?', help:'Pense em alguém que ainda não conhece a empresa.', options:[
      {label:'Encontra tudo organizado em uma página ou catálogo', scores:{}},
      {label:'Precisa procurar entre publicações e destaques', scores:{site:2,marketing:1}},
      {label:'Normalmente precisa perguntar por mensagem', scores:{site:3,systems:1}} ]},
    { topic:'DESCOBERTA', title:'Quando alguém pesquisa sua empresa no Google, encontra informações atualizadas?', help:'Incluindo localização, horários e canais de contato.', options:[
      {label:'Sim, as informações estão atualizadas', scores:{}},
      {label:'Não sei como a empresa aparece', scores:{site:1,marketing:1}},
      {label:'Não, ou as informações estão incompletas', scores:{site:2,marketing:1}} ]},
    { topic:'ORÇAMENTOS E PEDIDOS', title:'Como os clientes pedem orçamentos ou fazem pedidos?', help:'Escolha a opção mais parecida com sua rotina.', options:[
      {label:'Existe um processo claro e organizado', scores:{}},
      {label:'Principalmente pelo WhatsApp, de forma manual', scores:{systems:2}},
      {label:'As informações ficam espalhadas em diferentes conversas', scores:{systems:3}} ]},
    { topic:'TEMPO DA EQUIPE', title:'Sua equipe responde repetidamente às mesmas perguntas?', help:'Por exemplo: preços, serviços, horários e disponibilidade.', options:[
      {label:'Raramente', scores:{}},
      {label:'Às vezes', scores:{systems:1,site:1}},
      {label:'Frequentemente, e isso toma tempo', scores:{systems:3,site:1}} ]},
    { topic:'COMUNICAÇÃO', title:'Como está a frequência de divulgação da empresa?', help:'Considere as publicações e materiais de apresentação.', options:[
      {label:'Temos uma rotina consistente', scores:{}},
      {label:'Publicamos quando sobra tempo', scores:{marketing:2}},
      {label:'Quase não divulgamos ou não temos padrão', scores:{marketing:3}} ]},
    { topic:'APRESENTAÇÃO DA MARCA', title:'Sua comunicação transmite claramente o diferencial da empresa?', help:'O cliente entende por que escolher vocês?', options:[
      {label:'Sim, temos uma apresentação clara e padronizada', scores:{}},
      {label:'Em parte, ainda podemos melhorar', scores:{marketing:2}},
      {label:'Não temos uma apresentação bem definida', scores:{marketing:3}} ]},
    { topic:'OBJETIVO', title:'Qual é o principal objetivo da empresa agora?', help:'Ter um objetivo de crescimento não significa que exista um problema. Esta escolha ajuda a contextualizar o resultado.', options:[
      {label:'Ser encontrada e apresentar melhor os serviços', goal:'site'},
      {label:'Organizar atendimento, pedidos ou orçamentos', goal:'systems'},
      {label:'Divulgar melhor e ter comunicação mais consistente', goal:'marketing'},
      {label:'Manter o que já funciona e acompanhar resultados', goal:'maintain'} ]}
  ];
  const services = {
    site: {
      title:'Site e presença digital organizada',
      description:'Um espaço próprio pode reunir serviços, portfólio, informações e caminhos claros para contato. O WhatsApp continua sendo um canal importante para conversar e fechar.',
      first:'Liste os cinco serviços ou produtos mais procurados e organize fotos, descrição, localização e botão de contato em uma apresentação única.',
      actions:['Organize informações essenciais para novos clientes em um único lugar.','Revise como sua empresa aparece nas pesquisas e mantenha os dados públicos atualizados.','Facilite a passagem da apresentação dos serviços para o contato no WhatsApp.']
    },
    systems: {
      title:'Organização de atendimento e processos',
      description:'Um formulário, catálogo, fluxo de orçamento ou sistema simples pode ajudar a padronizar a entrada de informações e reduzir retrabalho — conforme a rotina real da empresa.',
      first:'Anote quais dados você precisa pedir em cada atendimento e crie uma sequência única de coleta antes de avaliar uma ferramenta.',
      actions:['Mapeie as perguntas repetidas e prepare respostas claras.','Padronize as informações necessárias para pedidos e orçamentos.','Avalie se um formulário ou sistema simples pode apoiar a equipe.']
    },
    marketing: {
      title:'Comunicação e apresentação profissional',
      description:'Uma identidade consistente e um plano simples de conteúdo podem deixar mais claro o que a empresa oferece, para quem e como entrar em contato.',
      first:'Escolha três serviços ou produtos prioritários e prepare uma publicação clara para cada um, com benefício, informação útil e próximo passo.',
      actions:['Defina a mensagem principal que diferencia a empresa.','Padronize os elementos visuais e os dados de contato.','Planeje uma frequência de divulgação que a equipe consiga manter.']
    },
    optimize: {
      title:'Pequenos ajustes antes de novos investimentos',
      description:'Suas respostas apontam pontos isolados de aperfeiçoamento, mas não sustentam uma recomendação de contratar um novo serviço neste momento.',
      first:'Revise o ponto identificado, teste um ajuste simples e observe o resultado antes de considerar uma nova ferramenta.',
      actions:['Escolha um ponto específico de melhoria.','Faça uma mudança simples que possa ser observada.','Reavalie se existe uma dificuldade recorrente antes de investir.']
    },
    maintain: {
      title:'Uma base digital bem estruturada',
      description:'Pelas suas respostas, a empresa já cuida das principais frentes avaliadas. Não identificamos uma necessidade clara de novo site, sistema ou serviço de comunicação neste questionário.',
      first:'Acompanhe de onde vêm os contatos e peça feedback a três clientes recentes para descobrir se existe algum atrito real na experiência deles.',
      actions:['Mantenha dados de contato e horários atualizados.','Observe quais canais trazem contatos qualificados.','Invista apenas quando houver uma oportunidade concreta ou um objetivo bem definido.']
    }
  };
  const $ = (id) => document.getElementById(id);
  const state = {index:0, answers:Array(questions.length).fill(null), business:'', segment:'', result:null};
  const intro=$('diagIntro'), quiz=$('diagQuiz'), result=$('diagResult');
  if (!intro || !quiz || !result) return;
  const show=(stage)=>{ intro.hidden=stage!=='intro';quiz.hidden=stage!=='quiz';result.hidden=stage!=='result';};
  const optionLabels=(q)=>q.options.map(o=>o.label);
  function renderQuestion(){
    const q=questions[state.index];
    $('diagCounter').textContent=`Pergunta ${state.index+1} de ${questions.length}`;
    $('diagProgress').setAttribute('aria-valuenow',String(state.index));
    $('diagProgressFill').style.width=`${(state.index/questions.length)*100}%`;
    $('diagTopic').textContent=q.topic;
    $('diagQuestionTitle').textContent=q.title;
    $('diagQuestionHelp').textContent=q.help;
    const options=$('diagOptions');
    options.replaceChildren();
    q.options.forEach((option,i)=>{
      const label=document.createElement('label');label.className='diag-option';
      const input=document.createElement('input');input.type='radio';input.name='diagnostico';input.value=String(i);input.checked=state.answers[state.index]===i;
      const letter=document.createElement('span');letter.className='diag-option-letter';letter.textContent=String.fromCharCode(65+i);
      const title=document.createElement('span');title.className='diag-option-label';title.textContent=option.label;
      const check=document.createElement('span');check.className='diag-option-check';check.setAttribute('aria-hidden','true');check.textContent='✓';
      label.append(input,letter,title,check);options.append(label);
      input.addEventListener('change',()=>{state.answers[state.index]=i; $('diagNext').disabled=false;});
    });
    $('diagBack').textContent=state.index===0?'← Início':'← Voltar';
    $('diagNext').innerHTML=state.index===questions.length-1?'Ver meu diagnóstico <span>↗</span>':'Continuar <span>→</span>';
    $('diagNext').disabled=state.answers[state.index]===null;
    $('diagQuestionTitle').focus({preventScroll:true});
  }
  // Critério transparente: as sete primeiras respostas trazem indícios de dificuldade.
  // A oitava registra um objetivo, jamais uma necessidade ou pontuação de problema.
  // 0 = sem dificuldade relatada; 1-2 = ajuste pontual; 3+ = área que merece avaliação.
  function calculate(){
    const scores={site:0,systems:0,marketing:0};
    questions.slice(0,7).forEach((q,i)=>{
      const option=q.options[state.answers[i]];
      if(option) Object.entries(option.scores || {}).forEach(([key,value])=>{scores[key]+=value;});
    });
    const goal=questions[7].options[state.answers[7]]?.goal || 'maintain';
    const ranking=Object.entries(scores).sort((a,b)=>b[1]-a[1] || (a[0]===goal?-1:b[0]===goal?1:0));
    const [focus,highest]=ranking[0];
    const primary=highest===0?'maintain':highest<3?'optimize':focus;
    const secondary=primary==='maintain'||primary==='optimize'?[]:ranking.filter(([key,value])=>value>=3&&key!==focus).map(([key])=>key);
    const strengths=[
      'Site próprio atualizado',
      'Informações de produtos ou serviços organizadas',
      'Dados públicos atualizados',
      'Processo claro de pedidos e orçamentos',
      'Poucas perguntas repetidas no atendimento',
      'Rotina consistente de divulgação',
      'Comunicação clara e padronizada'
    ].filter((_,i)=>state.answers[i]===0);
    return {primary,secondary,scores,goal,focus,strengths};
  }
  function resultService(){
    const {primary,focus}=state.result;
    if(primary!=='optimize') return services[primary];
    return {
      ...services.optimize,
      first:services[focus].first,
      actions:services[focus].actions
    };
  }
  function getSummary(){
    const {primary,secondary}=state.result;
    const service=resultService();
    const heading=service.title;
    const verdict=primary==='maintain'?'Situação identificada: boa base relatada':primary==='optimize'?'Situação identificada: ajustes pontuais':'Área para avaliação';
    const goal=questions[7].options[state.answers[7]].label;
    const lines=[`RAIO-X DIGITAL T3F — TAJO DIGITAL`,state.business?`Empresa: ${state.business}`:'Empresa: não informada',state.segment?`Segmento: ${state.segment}`:null,verdict,`Resultado: ${heading}`,`Objetivo informado: ${goal}`,`Primeiro passo: ${service.first}`];
    if(secondary.length) lines.push(`Outras áreas para observar: ${secondary.map(k=>services[k].title).join('; ')}`);
    lines.push('Respostas:');
    questions.forEach((q,i)=>lines.push(`${i+1}. ${q.title} — ${q.options[state.answers[i]].label}`));
    return lines.filter(Boolean).join('\n');
  }
  function renderResult(){
    state.result=calculate();
    const {primary,secondary,goal,strengths}=state.result;
    const service=resultService();
    const subject=state.business?`a empresa ${state.business}`:'seu negócio';
    const name=state.business?`da empresa ${state.business}`:'do seu negócio';
    const isMaintain=primary==='maintain';
    const isOptimize=primary==='optimize';
    const goalLabel=questions[7].options[state.answers[7]].label;
    $('diagResultTitle').textContent=isMaintain?`Pelas suas respostas, ${subject} apresenta uma boa estrutura digital.`:
      isOptimize?`Alguns ajustes podem deixar a presença digital ${name} ainda melhor.`:
      `Encontramos uma área para avaliar na presença digital ${name}.`;
    $('diagResultLead').textContent=isMaintain?
      `Você relatou bons processos nas áreas avaliadas. Seu objetivo é “${goalLabel}”, mas ter essa meta não significa que precise contratar algo agora.`:
      isOptimize?
      `Foram identificados apenas pontos isolados de melhoria. Seu objetivo é “${goalLabel}”; vale testar ajustes simples antes de investir.`:
      `Há sinais de atenção nas respostas. Seu objetivo é “${goalLabel}”. A recomendação considera as dificuldades relatadas, não apenas essa meta.`;
    $('diagResultTag').textContent=isMaintain?'PONTO FORTE IDENTIFICADO':isOptimize?'MELHORIA PONTUAL':'PRIORIDADE PARA AVALIAR';
    $('diagResultIcon').textContent=isMaintain?'✓':isOptimize?'↗':'↗';
    $('diagServiceTitle').textContent=service.title;
    $('diagServiceDescription').textContent=service.description;
    $('diagFirstStep').textContent=service.first;
    $('diagFirstStepLabel').textContent=isMaintain?'Como continuar evoluindo':isOptimize?'Primeiro ajuste prático':'Primeiro passo prático';
    $('diagRecommendationsTitle').textContent=isMaintain?'Pontos fortes relatados':isOptimize?'Pequenos ajustes sugeridos':'O que vale observar';
    const ol=$('diagRecommendations');ol.replaceChildren();
    const recommendations=isMaintain?strengths.slice(0,4):service.actions;
    recommendations.forEach((item)=>{const li=document.createElement('li');li.textContent=item;ol.append(li);});
    if(secondary.length){const li=document.createElement('li');li.textContent=`Outra frente que merece avaliação: ${secondary.slice(0,2).map(k=>services[k].title.toLowerCase()).join(' e ')}.`;ol.append(li);}
    const highlights=[0,3,7].map(i=>`${questions[i].topic}: ${questions[i].options[state.answers[i]].label}`).join('\n');
    const request=isMaintain?'Gostaria de tirar uma dúvida sobre a evolução da minha empresa.':
      isOptimize?'Gostaria de conversar sobre pequenos ajustes identificados no resultado.':
      'Gostaria de avaliar os próximos passos para meu negócio.';
    const message=`Olá, João! Fiz o RAIO-X Digital T3F no site da TAJO. ${request}\n\nEmpresa: ${state.business||'Não informada'}\nSegmento: ${state.segment||'Não informado'}\nResultado: ${service.title}\nObjetivo: ${goalLabel}\n\n${highlights}`;
    $('diagWhatsApp').href=`https://wa.me/5527999639610?text=${encodeURIComponent(message)}`;
    $('diagWhatsAppText').textContent=isMaintain?'Tirar uma dúvida com a TAJO':isOptimize?'Conversar sobre meus ajustes':'Conversar com a TAJO sobre meu resultado';
    show('result');$('diagResultTitle').focus({preventScroll:true});
    $('diagProgress').setAttribute('aria-valuenow','8');
    document.getElementById('diagApp').scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});
  }
  $('diagStart').addEventListener('submit',(event)=>{event.preventDefault();state.business=$('diagBusiness').value.trim().slice(0,80);state.segment=$('diagSegment').value;show('quiz');renderQuestion();});
  $('diagBack').addEventListener('click',()=>{if(state.index===0){show('intro');return;}state.index--;renderQuestion();});
  $('diagNext').addEventListener('click',()=>{if(state.answers[state.index]===null)return;if(state.index<questions.length-1){state.index++;renderQuestion();}else renderResult();});
  $('diagReset').addEventListener('click',()=>{state.index=0;state.answers.fill(null);state.result=null;$('diagCopy').textContent='Copiar meu resumo';show('intro');$('diagBusiness').focus();});
  $('diagCopy').addEventListener('click',async()=>{
    const value=getSummary();
    try{await navigator.clipboard.writeText(value);$('diagCopy').textContent='Resumo copiado ✓';}
    catch(_){const ta=document.createElement('textarea');ta.value=value;ta.style.position='fixed';ta.style.opacity='0';document.body.append(ta);ta.select();try{document.execCommand('copy');$('diagCopy').textContent='Resumo copiado ✓';}catch(e){$('diagCopy').textContent='Selecione o resumo no WhatsApp';}ta.remove();}
  });
})();
