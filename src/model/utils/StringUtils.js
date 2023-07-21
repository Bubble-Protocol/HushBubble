

export function toBase64Url(buf) {
  return buf.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}


export function fromBase64Url(str) {
  let b64str = str.replace(/-/g, '+').replace(/_/g, '/');
  while (b64str.length % 4) {
    b64str += '=';
  }
  return Buffer.from(b64str, 'base64');
}
