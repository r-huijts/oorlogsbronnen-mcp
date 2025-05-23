export function processUrl(id: string): string {
  const prefix = 'https://www.oorlogsbronnen.nl/record/';

  // If the ID already starts with the prefix and contains another URL
  if (id.startsWith(prefix) && id.substring(prefix.length).startsWith('http')) {
    return id.substring(prefix.length);
  }

  // If the ID is already a full URL
  if (id.startsWith('http')) {
    return id;
  }

  // Otherwise, add the prefix to create a valid URL
  return `${prefix}${id}`;
}
