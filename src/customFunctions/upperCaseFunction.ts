function upperCaseFunction(value: string | undefined) {
  const upcString = value?.trim().toUpperCase();
  const upcStringA = upcString?.replace(/Á/g, 'A');
  const upcStringE = upcStringA?.replace(/É/g, 'E');
  const upcStringI = upcStringE?.replace(/Í/g, 'I');
  const upcStringO = upcStringI?.replace(/Ó/g, 'O');
  const upcStringU = upcStringO?.replace(/Ú/g, 'U');

  return upcStringU;
}

export default upperCaseFunction;
