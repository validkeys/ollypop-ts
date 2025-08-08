export const utilities = {
  formatDate: (date: Date) => date.toISOString(),
  generateId: () => Math.random().toString(36).substr(2, 9),
  capitalize: (str: string) => str.charAt(0).toUpperCase() + str.slice(1)
};
