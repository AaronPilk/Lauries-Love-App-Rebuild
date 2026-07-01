export default function sleep(timems: number): Promise<void> {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve();
    }, timems);
  });
}
