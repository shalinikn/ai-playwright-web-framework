const firstNames = ['Ava', 'Liam', 'Noah', 'Mia', 'Arjun', 'Sofia', 'Chen', 'Amara'];
const lastNames = ['Patel', 'Garcia', 'Kim', 'Okafor', 'Rossi', 'Silva'];

const pick = (list: string[]) => list[Math.floor(Math.random() * list.length)];

// Creates a random fake customer for checkout forms.
export function randomUser() {
  return {
    firstName: pick(firstNames),
    lastName: pick(lastNames),
    postalCode: String(Math.floor(10000 + Math.random() * 90000)),
  };
}
