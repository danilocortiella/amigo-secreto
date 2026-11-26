// Cole aqui a URL do App da Web gerada no Google Apps Script:
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyNkAxJDno3mkHdAijr6w4l0n5XseWTgAjSBWXpeNsJNEYzTlPdJ2ueUT9_91c44His/exec';

const selectEl = document.getElementById('person-select');
const statusEl = document.getElementById('status-message');
const resultsSection = document.getElementById('results-section');
const selectedNameEl = document.getElementById('selected-person-name');
const itemsCountEl = document.getElementById('items-count');
const giftListEl = document.getElementById('gift-list');

let allItems = [];

async function init() {
  if (!APPS_SCRIPT_URL) {
    selectEl.innerHTML = '<option value="">Configure a URL do Apps Script</option>';
    setStatus('Cole a URL do App da Web do Apps Script em app.js para carregar os dados.', true);
    return;
  }

  try {
    setStatus('Buscando sugestões na planilha...');
    const response = await fetch(APPS_SCRIPT_URL, { cache: 'no-store' });
    if (!response.ok) {
      throw new Error(`Erro HTTP ${response.status}`);
    }

    const data = await response.json();
    if (data.error) {
      throw new Error(data.error);
    }

    allItems = Array.isArray(data.items) ? data.items : [];
    const people = Array.isArray(data.people) ? data.people : [];

    populateSelect(people);
    setStatus(`${people.length} participantes carregados.`);
  } catch (err) {
    console.error(err);
    selectEl.innerHTML = '<option value="">Erro ao carregar</option>';
    setStatus('Não foi possível carregar as sugestões. Tente recarregar a página.', true);
  }
}

function populateSelect(people) {
  selectEl.innerHTML = '<option value="">-- Selecione uma pessoa --</option>';

  people.forEach((person) => {
    const option = document.createElement('option');
    option.value = person;
    option.textContent = person;
    selectEl.appendChild(option);
  });

  selectEl.disabled = false;
}

selectEl.addEventListener('change', (event) => {
  const person = event.target.value;
  if (!person) {
    resultsSection.hidden = true;
    return;
  }
  renderPersonGifts(person);
});

function renderPersonGifts(person) {
  const personItems = allItems.filter((item) => item.pessoa === person);

  selectedNameEl.textContent = `Sugestões de ${person}`;
  itemsCountEl.textContent =
    personItems.length === 1 ? '1 sugestão' : `${personItems.length} sugestões`;

  giftListEl.innerHTML = '';

  if (personItems.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'empty-state';
    empty.textContent = 'Nenhuma sugestão cadastrada ainda para esta pessoa.';
    giftListEl.appendChild(empty);
    resultsSection.hidden = false;
    return;
  }

  personItems.forEach((item, index) => {
    const card = document.createElement('article');
    card.className = 'gift-card';

    const top = document.createElement('div');
    top.className = 'gift-top';

    const title = document.createElement('h3');
    title.className = 'gift-title';
    title.textContent = item.presente || 'Sugestão de presente';

    const num = document.createElement('span');
    num.className = 'gift-number';
    num.textContent = `#${index + 1}`;

    top.appendChild(title);
    top.appendChild(num);
    card.appendChild(top);

    if (item.tamanho || item.cor) {
      const badges = document.createElement('div');
      badges.className = 'badges';

      if (item.tamanho) {
        badges.appendChild(createBadge(`📏 Tam: ${item.tamanho}`));
      }
      if (item.cor) {
        badges.appendChild(createBadge(`🎨 Cor: ${item.cor}`));
      }

      card.appendChild(badges);
    }

    if (item.descricao) {
      const desc = document.createElement('p');
      desc.className = 'gift-desc';
      desc.textContent = item.descricao;
      card.appendChild(desc);
    }

    if (item.link) {
      const actions = document.createElement('div');
      actions.className = 'gift-actions';

      const linkBtn = document.createElement('a');
      linkBtn.className = 'btn-link';
      linkBtn.href = item.link;
      linkBtn.target = '_blank';
      linkBtn.rel = 'noopener noreferrer';
      linkBtn.textContent = 'Abrir link do presente ↗';

      actions.appendChild(linkBtn);
      card.appendChild(actions);
    }

    giftListEl.appendChild(card);
  });

  resultsSection.hidden = false;
}

function createBadge(text) {
  const span = document.createElement('span');
  span.className = 'badge';
  span.textContent = text;
  return span;
}

function setStatus(message, isError = false) {
  statusEl.textContent = message;
  statusEl.classList.toggle('error', isError);
}

init();
