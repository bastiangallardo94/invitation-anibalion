export const touchInput = {
  moveX: 0,
  moveY: 0,
  jump: false,
  lookDX: 0,
  lookDY: 0,
};

export function consumeTouchLook() {
  const dx = touchInput.lookDX;
  const dy = touchInput.lookDY;
  touchInput.lookDX = 0;
  touchInput.lookDY = 0;
  return { dx, dy };
}
