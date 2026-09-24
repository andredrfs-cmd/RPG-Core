const { NAME_MIN_LENGTH, NAME_MAX_LENGTH, NAME_PATTERN } = require('../../config/gameConfig');

function validateName(value) {
  if (typeof value !== 'string') {
    return { valid: false, message: 'Digite um nome válido.' };
  }

  const name = value.trim().replace(/\s+/g, ' ');

  if (name.length < NAME_MIN_LENGTH) {
    return { valid: false, message: `O nome precisa ter pelo menos ${NAME_MIN_LENGTH} caracteres.` };
  }

  if (name.length > NAME_MAX_LENGTH) {
    return { valid: false, message: `O nome pode ter no máximo ${NAME_MAX_LENGTH} caracteres.` };
  }

  if (!NAME_PATTERN.test(name)) {
    return { valid: false, message: 'Use apenas letras, números, espaços, hífen ou sublinhado.' };
  }

  return { valid: true, name };
}

function isNameTaken(name, players, currentPlayer) {
  const normalizedName = name.toLocaleLowerCase();

  return Array.from(players.values()).some((player) => (
    player !== currentPlayer &&
    player.name &&
    player.name.toLocaleLowerCase() === normalizedName
  ));
}

module.exports = {
  validateName,
  isNameTaken
};
