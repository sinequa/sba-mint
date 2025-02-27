export function isNotInputEvent(event: KeyboardEvent): boolean {
  const target: HTMLElement | null = event.target as HTMLElement;
  return target && target.nodeName !== 'INPUT' && target.nodeName !== 'TEXTAREA';
}
