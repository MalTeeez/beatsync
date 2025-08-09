// I got very annoyed with the prevalent cookie handling libraries, and since we don't need
// to do anything crazy, here is a very simple implementation

export function getCookie(name: string): string | undefined {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift();
}

export function removeCookie(name: string) {
  const secure = !window.location.host.startsWith("127.0.0.1");
  document.cookie = `${name}=; max-age=0; path=/; ${secure ? 'secure;' : ''}`;
}

export function setCookie(name: string, value: string, maxAge: number) {
  const secure = !window.location.host.startsWith("127.0.0.1");
  document.cookie = `${name}=${value}; max-age=${maxAge}; path=/; ${secure ? 'secure;' : ''}`;
}
