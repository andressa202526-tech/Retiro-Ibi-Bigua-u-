
const valores = {
  adulto: 350,
  crianca: 175
};

const categoria = document.getElementById("categoria");
const total = document.getElementById("total");
const parcelas = document.getElementById("parcelas");
const formulario = document.getElementById("formInscricao");
const aviso = document.getElementById("aviso");
const botao = document.getElementById("botaoInscricao");

const URL_INSCRICAO =
  "https://bkzdjqjqjjcrojyajuvr.supabase.co/functions/v1/cadastrar-inscricao";

const moeda = valor =>
  valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });

function atualizarPreco() {
  const valor = valores[categoria.value];

  total.textContent = moeda(valor);
  parcelas.textContent =
    `4 parcelas de ${moeda(valor / 4)}`;
}

categoria.addEventListener("change", atualizarPreco);
atualizarPreco();

formulario.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!formulario.reportValidity()) return;

  const nome = document.getElementById("nome").value.trim();
  const whatsapp =
    document.getElementById("telefone").value.trim();
  const pagamento =
    document.getElementById("pagamento").value;

  const captchaToken =
    document.querySelector(
      '[name="cf-turnstile-response"]'
    )?.value || "";

  if (!captchaToken) {
    aviso.textContent =
      "Conclua a verificação de segurança.";
    return;
  }

  botao.disabled = true;
  botao.textContent = "Enviando inscrição...";
  aviso.textContent = "Aguarde, estamos enviando seus dados.";

  try {
    const resposta = await fetch(URL_INSCRICAO, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        nome,
        whatsapp,
        categoria: categoria.value,
        pagamento,
        captchaToken
      })
    });

    const dados = await resposta.json();

    if (!resposta.ok || !dados.sucesso) {
      throw new Error(
        dados.erro || "Não foi possível enviar a inscrição."
      );
    }

    aviso.textContent =
      "Pré-inscrição recebida com sucesso! " +
      "Aguarde a confirmação da organização da IBI Biguaçu.";

    formulario.reset();
    atualizarPreco();

    if (window.turnstile) {
      window.turnstile.reset();
    }

  } catch (erro) {
    aviso.textContent =
      "Não foi possível confirmar o envio. " +
      "Entre em contato com a organização antes " +
      "de tentar novamente, para evitar duplicidade.";

    console.error("Erro na inscrição:", erro);
  } finally {
    botao.disabled = false;
    botao.textContent = "Enviar pré-inscrição";
  }
});
