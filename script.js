const valores = { adulto: 350, crianca: 175 };
const categoria = document.getElementById('categoria');
const total = document.getElementById('total');
const parcelas = document.getElementById('parcelas');
const moeda = valor => valor.toLocaleString('pt-BR', {style:'currency',currency:'BRL'});
function atualizarPreco(){
  const valor = valores[categoria.value];
  total.textContent = moeda(valor);
  parcelas.textContent = `4 parcelas de ${moeda(valor / 4)}`;
}
categoria.addEventListener('change', atualizarPreco);
atualizarPreco();
document.getElementById('formInscricao').addEventListener('submit', event => {
  event.preventDefault();
  const form = event.currentTarget;
  if (!form.reportValidity()) return;
  const nome = document.getElementById('nome').value.trim();
  const telefone = document.getElementById('telefone').value.trim();
  if (!nome || !telefone) return;
  const valor = valores[categoria.value];
  const modo = document.getElementById('pagamento').selectedOptions[0].textContent;
  const resumo = `Pré-inscrição — Retiro 2027 IBI Biguaçu\nNome: ${nome}\nWhatsApp: ${telefone}\nCategoria: ${categoria.selectedOptions[0].textContent}\nTotal: ${moeda(valor)}\n4 parcelas: ${moeda(valor/4)}\nPreferência de pagamento: ${modo}\nAguardando confirmação da organização.`;
  // Nenhum dado é enviado ou armazenado por esta versão estática.
  document.getElementById('aviso').textContent = 'Resumo preparado! Copie os dados para enviar à organização. Sua vaga ainda não foi reservada.';
  const botao = document.createElement('button');
  botao.type = 'button'; botao.className = 'primary'; botao.style.marginTop = '12px';
  botao.textContent = 'Copiar resumo da pré-inscrição';
  botao.addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(resumo); botao.textContent = 'Resumo copiado!'; }
    catch { window.prompt('Copie o resumo:', resumo); }
  });
  document.querySelector('#aviso').nextElementSibling?.remove();
  document.getElementById('aviso').after(botao);
});
