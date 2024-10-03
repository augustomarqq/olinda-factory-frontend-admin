const api_url = "http://127.0.0.1:8080/";
const headers = {
  "Content-Type": "application/json",
};

export async function buscarSetores() {
  const response = await fetch(api_url + "setores", {
    method: "GET",
    headers: headers,
  });

  const data = await response.json();

  return data;
}

export async function criarSetor(nome) {
  let data = {
    nome: nome,
  };

  fetch(api_url + "setores", {
    method: "POST",
    headers: headers,
    body: JSON.stringify(data),
  });
}

export async function criarFuncionario(nome, setorId, cargo) {
  let data = {
    nome: nome,
    setorId: setorId,
    cargo: cargo,
  };

  fetch(api_url + "funcionarios", {
    method: "POST",
    headers: headers,
    body: JSON.stringify(data),
  });
}

export async function buscarSetorX(setor_id) {
  const response = await fetch(`${api_url}setores/${setor_id}`, {
    method: "GET",
    headers: headers,
  });

  const data = await response.json();

  return data;
}

export async function buscarRelatos() {
  const response = await fetch(api_url + "relatos", {
    method: "GET",
    headers: headers,
  });

  const data = await response.json();

  return data;
}

export async function buscarRelatosPorSetor(setor_id) {
  const response = await fetch(`${api_url}relatos/setor/${setor_id}`, {
    method: "GET",
    headers: headers,
  });

  const data = await response.json();

  return data;
}