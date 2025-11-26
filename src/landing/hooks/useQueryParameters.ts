import { useSearchParams } from 'react-router';

export const useQueryParameters = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const page = searchParams.get('page') ?? '1';
  const limit = searchParams.get('limit') ?? '12';
  const orden = searchParams.get('orden') ?? '';
  const ordenarPor = searchParams.get('ordenarPor') ?? '';
  const flores = searchParams.get('flores') ?? '';
  const precioMin = searchParams.get('precioMin') ?? '';
  const precioMax = searchParams.get('precioMax') ?? '';
  const idFormaArreglo = searchParams.get('idFormaArreglo') ?? '';

  return {
    page,
    limit,
    orden,
    ordenarPor,
    flores,
    precioMin,
    precioMax,
    idFormaArreglo,
    setSearchParams,
  };
};
