// Creative corner: three panels, one open at a time. The open one grows and
// its line drawing traces itself.
export function initRooms({ finePointer }) {
  const rooms = [...document.querySelectorAll('[data-rooms] .room')];
  if (!rooms.length) return;

  const open = (room) => {
    rooms.forEach((other) => {
      const isOpen = other === room;
      other.classList.toggle('open', isOpen);
      other.setAttribute('aria-expanded', String(isOpen));
    });
  };

  rooms.forEach((room) => {
    room.addEventListener('click', () => open(room));
    room.addEventListener('focus', () => open(room));
    if (finePointer) room.addEventListener('pointerenter', () => open(room));
  });
}
