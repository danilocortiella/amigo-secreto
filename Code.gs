/**
 * Google Apps Script — API JSON para o Amigo Secreto da Família
 *
 * Como publicar:
 * 1. Na planilha, vá em Extensões > Apps Script.
 * 2. Cole este código no arquivo Code.gs e salve.
 * 3. Clique em "Implantar" > "Nova implantação".
 * 4. Tipo: "App da Web".
 * 5. Executar como: "Eu" (seu e-mail).
 * 6. Quem pode acessar: "Qualquer pessoa".
 * 7. Copie a URL do App da Web gerada e cole no arquivo app.js.
 */

const SHEET_NAME = 'Sugestoes';

function doGet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_NAME);

  if (!sheet) {
    return jsonResponse({ error: `Aba "${SHEET_NAME}" não encontrada.` });
  }

  const values = sheet.getDataRange().getValues();
  if (values.length <= 1) {
    return jsonResponse({ people: [], items: [] });
  }

  const headers = values[0].map((h) => String(h).trim().toLowerCase());
  const idx = {
    pessoa: headers.indexOf('pessoa'),
    presente: headers.indexOf('presente'),
    tamanho: headers.indexOf('tamanho'),
    cor: headers.indexOf('cor'),
    link: headers.indexOf('link'),
    descricao: headers.indexOf('descricao'),
  };

  const items = [];
  const peopleSet = new Set();

  for (let i = 1; i < values.length; i++) {
    const row = values[i];
    const pessoa = getCell(row, idx.pessoa);
    const presente = getCell(row, idx.presente);
    const link = getCell(row, idx.link);

    if (!pessoa || (!presente && !link)) continue;

    peopleSet.add(pessoa);
    items.push({
      pessoa,
      presente: presente || 'Sugestão de presente',
      tamanho: getCell(row, idx.tamanho),
      cor: getCell(row, idx.cor),
      link,
      descricao: getCell(row, idx.descricao),
    });
  }

  const people = Array.from(peopleSet).sort((a, b) =>
    a.localeCompare(b, 'pt-BR', { sensitivity: 'base' })
  );

  return jsonResponse({
    updatedAt: new Date().toISOString(),
    people,
    items,
  });
}

function getCell(row, index) {
  if (index < 0 || index >= row.length) return '';
  return String(row[index] ?? '').trim();
}

function jsonResponse(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(
    ContentService.MimeType.JSON
  );
}
