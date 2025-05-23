import { FormNode } from "../types";

export function getUpstreamForms(
  formId: string,
  graph: Record<string, string[]>
): string[] {
  const result: Set<string> = new Set();
  const visit = (node: string) => {
    if (graph[node]) {
      graph[node].forEach((parent) => {
        if (!result.has(parent)) {
          result.add(parent);
          visit(parent);
        }
      });
    }
  };
  visit(formId);
  return Array.from(result);
}
