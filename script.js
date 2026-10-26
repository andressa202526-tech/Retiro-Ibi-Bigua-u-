
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

  if (valor === undefined) {
    total.textContent = "Selecione uma categoria";
    parcelas.textContent = "";
    return;
  }

  total.textContent = moeda(valor);

  const centavos = Math.round(valor * 100);
  const base = Math.floor(centavos / 3);
  const ultima = centavos - base * 2;

  parcelas.textContent =
    `3 parcelas: 2 de ${moeda(base / 100)} ` +
    `e a última de ${moeda(ultima / 100)}`;
}

categoria.addEventListener("change", atualizarPreco);
atualizarPreco();

formulario.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!formulario.reportValidity()) return;
  if (botao.disabled) return;

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
  aviso.textContent = "Enviando seus dados...";

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

    const texto = await resposta.text();

    let dados;

    try {
      dados = JSON.parse(texto);
    } catch {
      throw new Error(
        `Servidor retornou HTTP ${resposta.status}. ` +
        "Não foi possível confirmar o cadastro."
      );
    }

    if (!resposta.ok || !dados.sucesso) {
      throw new Error(
        dados.erro ||
        `Erro HTTP ${resposta.status} ao cadastrar.`
      );
    }

    aviso.textContent =
      "✅ Pré-inscrição recebida com sucesso! " +
      "Aguarde a confirmação da organização da IBI Biguaçu.";

    formulario.reset();
    atualizarPreco();

    if (window.turnstile) {
      window.turnstile.reset();
    }

  } catch (erro) {
    const mensagem =
      erro instanceof Error
        ? erro.message
        : "Erro desconhecido.";

    console.error("Erro na inscrição:", erro);

    aviso.textContent =
      "❌ " + mensagem +
      " Se você já tentou se inscrever, " +
      "confirme com a organização antes de reenviar, " +
      "para evitar duplicidade.";

    if (window.turnstile) {
      window.turnstile.reset();
    }

  } finally {
    botao.disabled = false;
    botao.textContent = "Enviar pré-inscrição";
  }
});
