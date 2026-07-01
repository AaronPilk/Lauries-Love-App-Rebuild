export default function getUserPicsPath(cognitoId: string): string {
  return `users/${cognitoId}`;
}
