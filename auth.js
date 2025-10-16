export function getAuth() {
  try {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user") || "null");
    return { token, user, authed: !!token && !!user };
  } catch {
    return { token: null, user: null, authed: false };
  }
}

export function hasRole(user, roles = []) {
  return !!user && roles.includes(user.role);
}

export function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}
