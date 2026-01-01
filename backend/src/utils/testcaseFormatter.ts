export const formatInput = (input: any[]): string => {
  return input
    .map(i => Array.isArray(i) ? i.join(" ") : i)
    .join("\n");
};

export const formatOutput = (output: any): string => {
  return Array.isArray(output) ? output.join(" ") : String(output);
};
