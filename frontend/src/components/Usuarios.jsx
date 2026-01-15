import { useEffect, useState } from "react";
import { getUsuarios } from "../api/api";

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);

  useEffect(() => {
    getUsuarios().then(setUsuarios);
  }, []);

  return (
    <div>
      <h2>Usuarios</h2>
      <ul>
        {usuarios.map((u) => (
          <li key={u.id}>{u.nombre_usuario}</li>
        ))}
      </ul>
    </div>
  );
}
