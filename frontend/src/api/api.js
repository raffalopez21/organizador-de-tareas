const API_URL = "http://127.0.0.1:5000";

export const getUsuarios = async () => {
  const res = await fetch(`${API_URL}/usuarios`);
  return res.json();
};

export const createUsuario = async (usuario) => {
  const res = await fetch(`${API_URL}/usuarios`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(usuario)
  });
  return res.json();
};
