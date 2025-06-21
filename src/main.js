import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

// === PREENCHA COM SEUS DADOS DO SUPABASE ===
const supabaseUrl = 'https://nqbixkwmguvyzhukcxoq.supabase.co'; // ex: https://xxxx.supabase.co
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5xYml4a3dtZ3V2eXpodWtjeG9xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1MzAzMDQsImV4cCI6MjA2NjEwNjMwNH0.fOV_TwcD3gJPCDFbS-rqi9AyI9JarU7gogz2T1dsDj8';
const supabase = createClient(supabaseUrl, supabaseKey);

// JavaScript extraído de interface.html
// ... código JS do <script> do HTML ... 

// util helpers
const $  = (sel, p=document) => p.querySelector(sel);
const $$ = (sel, p=document) => p.querySelectorAll(sel);

// refs fixas
const modal       = $('#agent-modal');
const newBtn      = $('#new-agent-btn');
const closeBtn    = $('#close-modal');
const cancelBtn   = $('#cancel-modal');
const modelSel    = $('#model-select');
const tempSlide   = $('#temp-slider');
const presSlide   = $('#presence-slider');
const freqSlide   = $('#freq-slider');
const tempVal     = $('#temp-value');
const presVal     = $('#presence-value');
const freqVal     = $('#freq-value');
const agentName   = $('#agent-name');
const promptInput = $('#prompt-input');
const agentsGrid  = $('#agents-grid');
const saveBtns    = document.querySelectorAll('.bg-accent.rounded-md');
const agentDesc   = $('#agent-desc');

let agenteEditandoIdx = null; // null = novo agente
let agenteEditandoId = null;  // id do agente no banco

// Função para buscar agentes do Supabase
document.addEventListener('DOMContentLoaded', async () => {
  const agentes = await buscarAgentes();
  renderAgentes(agentes);
});

async function buscarAgentes() {
  const { data, error } = await supabase
    .from('agentes')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) {
    alert('Erro ao buscar agentes!');
    return [];
  }
  return data;
}

// Função para renderizar os cards de agentes
function renderAgentes(agentes) {
  agentsGrid.innerHTML = '';
  agentes.forEach((agente, idx) => {
    const card = document.createElement('div');
    card.className = 'agent-card cursor-pointer p-5 bg-surface border border-[#1d1d1d] rounded-lg';
    card.dataset.idx = idx;
    card.dataset.id = agente.id;
    card.dataset.model = agente.modelo;
    card.dataset.temp = agente.temperatura;
    card.dataset.presence = agente.presence_penalty;
    card.dataset.frequency = agente.frequency_penalty;
    card.dataset.nome = agente.nome;
    card.dataset.prompt = agente.prompt;
    card.dataset.desc = agente.descricao || '';

    card.innerHTML = `
      <div class="flex items-start justify-between mb-4">
        <div class="flex items-center gap-2">
          <div class="h-6 w-6 rounded-full bg-[#2a2a2a] flex items-center justify-center text-[#c9c9c9] text-xs">⚙</div>
          <h2 class="text-base font-semibold">${agente.nome}</h2>
        </div>
        <div class="flex items-center gap-3 text-[#8a8a8a] text-sm">💬 ⚙</div>
      </div>
      <p class="text-sm text-[#b2b2b2] mb-4">${agente.descricao || ''}</p>
      <div class="flex items-center justify-end text-xs text-[#cccccc]">
        <div>${agente.modelo}</div>
      </div>
    `;
    // Ao clicar no card, abre o modal com os dados do agente
    card.addEventListener('click', () => {
      agenteEditandoIdx = idx;
      agenteEditandoId = agente.id;
      agentName.value = agente.nome;
      agentDesc.value = agente.descricao || '';
      modelSel.value = agente.modelo;
      tempSlide.value = agente.temperatura;
      presSlide.value = agente.presence_penalty;
      freqSlide.value = agente.frequency_penalty;
      tempVal.textContent = agente.temperatura;
      presVal.textContent = agente.presence_penalty;
      freqVal.textContent = agente.frequency_penalty;
      promptInput.value = agente.prompt;
      openModal();
    });
    agentsGrid.appendChild(card);
  });
}

// Ao clicar em Novo Agente, limpa o índice de edição e os campos
newBtn.addEventListener('click', () => {
  agenteEditandoIdx = null;
  agenteEditandoId = null;
  agentName.value = '';
  agentDesc.value = '';
  modelSel.value = 'GPT 4o';
  tempSlide.value = '0.5';
  presSlide.value = '0';
  freqSlide.value = '0';
  tempVal.textContent = tempSlide.value;
  presVal.textContent = presSlide.value;
  freqVal.textContent = freqSlide.value;
  promptInput.value = '';
  openModal();
});

// Salvar ou atualizar agente no Supabase
saveBtns.forEach(btn => {
  btn.addEventListener('click', async (e) => {
    if (!modal.classList.contains('hidden')) {
      const agenteData = {
        nome: agentName.value || 'Novo Agente',
        descricao: agentDesc.value || '',
        modelo: modelSel.value,
        temperatura: tempSlide.value,
        presence_penalty: presSlide.value,
        frequency_penalty: freqSlide.value,
        prompt: promptInput.value || ''
      };
      if (agenteEditandoId) {
        await atualizarAgente(agenteEditandoId, agenteData);
      } else {
        await salvarAgente(agenteData);
      }
      const agentes = await buscarAgentes();
      renderAgentes(agentes);
      closeModal();
    }
  });
});

async function salvarAgente(agente) {
  const { error } = await supabase
    .from('agentes')
    .insert([agente]);
  if (error) alert('Erro ao salvar agente!');
}

async function atualizarAgente(id, agente) {
  const { error } = await supabase
    .from('agentes')
    .update(agente)
    .eq('id', id);
  if (error) alert('Erro ao atualizar agente!');
}

// input display
const bindDisplay = (slider, label) => {
  label.textContent = slider.value;
  slider.addEventListener('input', () => label.textContent = slider.value);
};
bindDisplay(tempSlide, tempVal);
bindDisplay(presSlide, presVal);
bindDisplay(freqSlide, freqVal);

// modal helpers
const openModal  = () => modal.classList.remove('hidden');
const closeModal = () => modal.classList.add('hidden');

[closeBtn, cancelBtn].forEach(b => b.addEventListener('click', closeModal));
window.addEventListener('keydown', e => e.key==='Escape' && !modal.classList.contains('hidden') && closeModal());

// tabs
function activateTab(tab){
  $$('.tab-btn').forEach(b=>{
    const act=b.dataset.tab===tab;
    b.classList.toggle('border-accent', act);
    b.classList.toggle('text-white', act);
    b.classList.toggle('text-[#b2b2b2]', !act);
  });
  $$('.tab-content').forEach(c=>{
    c.classList.toggle('hidden', c.dataset.tabContent !== tab);
  });
}

// event listeners para tabs
$$('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => activateTab(btn.dataset.tab));
});

// --- LÓGICA DO CHAT DE TESTE ---
const chatMessages = $('#chat-messages');
const chatInput    = $('#chat-input');
const sendBtn      = $('#send-btn');

function addChatMessage(message, isUser) {
  if (!chatMessages) return;
  const msgWrapper = document.createElement('div');
  msgWrapper.classList.add('flex', isUser ? 'justify-end' : 'justify-start');
  const msgBubble = document.createElement('div');
  msgBubble.classList.add(isUser ? 'bg-accent' : 'bg-[#2a2a2a]', 'rounded-lg', 'p-3', 'max-w-[80%]');
  const msgText = document.createElement('p');
  msgText.classList.add('text-sm');
  msgText.textContent = message;
  msgBubble.appendChild(msgText);
  msgWrapper.appendChild(msgBubble);
  chatMessages.appendChild(msgWrapper);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function handleSendMessage() {
  const message = chatInput.value.trim();
  if (message) {
    addChatMessage(message, true); // Adiciona a mensagem do usuário
    chatInput.value = '';
    // A lógica para chamar o backend e receber a resposta do agente virá aqui.
  }
}

sendBtn?.addEventListener('click', handleSendMessage);
chatInput?.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault(); // Impede que o Enter crie uma nova linha
    handleSendMessage();
  }
}); 