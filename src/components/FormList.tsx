import { useEffect, useState } from "react";
import { FormNode } from "../types";

export default function FormList() {
  const [forms, setForms] = useState<FormNode[]>([]);

  useEffect(() => {
    fetch("http://localhost:3001/action-blueprint-graph")
      .then((res) => res.json())
      .then((data) => {
        setForms(data.nodes);
      });
  }, []);

  return (
    <div>
      <h2>Form List</h2>
      <ul>
        {forms.map((form) => (
          <li key={form.id}>{form.name}</li>
        ))}
      </ul>
    </div>
  );
}
