function displayNotification() {
  const message = new URLSearchParams(window.location.hash.slice(1));
  // Le contenu reçu reste du texte, même s'il contient des balises HTML.
  document.getElementById('title').textContent = message.get('title') || 'Bénévoles';
  document.getElementById('message').textContent = message.get('body') || 'Vos choix ont bien été pris en compte.';
  const received = document.getElementById('received');
  const date = new Date(message.get('at') || '');
  received.hidden = !Number.isFinite(date.getTime());
  if (!received.hidden) {
    received.dateTime = date.toISOString();
    received.textContent = `Reçue le ${date.toLocaleString('fr-FR')}`;
  }
  const link = document.getElementById('event-link');
  link.href = '/';
  try {
    const target = new URL(message.get('url') || '/', window.location.origin);
    if (target.origin === window.location.origin) link.href = target.href;
  } catch { /* conserver l'accueil si l'adresse est invalide */ }
}

displayNotification();
window.addEventListener('hashchange', displayNotification);
