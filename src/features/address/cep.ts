export type PostalCodeLookupResult = {
  street: string;
  district: string;
  city: string;
  state: string;
  country: string;
  number: string | null;
  complement: string | null;
};

interface PostalCodeProvider {
  lookup(cep: string): Promise<PostalCodeLookupResult | null>;
}

class ViaCepProvider implements PostalCodeProvider {
  async lookup(cep: string): Promise<PostalCodeLookupResult | null> {
    const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });

    if (!response.ok) return null;

    const payload = (await response.json()) as {
      erro?: boolean;
      logradouro?: string;
      bairro?: string;
      localidade?: string;
      uf?: string;
      complemento?: string;
    };

    if (payload.erro) return null;
    if (
      !payload.logradouro &&
      !payload.bairro &&
      !payload.localidade &&
      !payload.uf
    ) {
      return null;
    }

    return {
      street: payload.logradouro ?? '',
      district: payload.bairro ?? '',
      city: payload.localidade ?? '',
      state: payload.uf ?? '',
      country: 'Brazil',
      number: null,
      complement: payload.complemento ?? null,
    };
  }
}

class BrasilApiProvider implements PostalCodeProvider {
  async lookup(cep: string): Promise<PostalCodeLookupResult | null> {
    const response = await fetch(`https://brasilapi.com.br/api/cep/v1/${cep}`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });

    if (!response.ok) return null;

    const payload = (await response.json()) as {
      street?: string;
      neighborhood?: string;
      city?: string;
      state?: string;
      complement?: string;
      service?: string;
    };

    if (
      !payload.street &&
      !payload.neighborhood &&
      !payload.city &&
      !payload.state
    ) {
      return null;
    }

    return {
      street: payload.street ?? '',
      district: payload.neighborhood ?? '',
      city: payload.city ?? '',
      state: payload.state ?? '',
      country: 'Brazil',
      number: null,
      complement: payload.complement ?? null,
    };
  }
}

export class PostalCodeService {
  constructor(private readonly providers: PostalCodeProvider[]) {}

  async lookup(cep: string): Promise<PostalCodeLookupResult | null> {
    const normalized = cep.replace(/\D/g, '').slice(0, 8);
    if (normalized.length !== 8) return null;

    for (const provider of this.providers) {
      try {
        const result = await provider.lookup(normalized);
        if (result) {
          return result;
        }
      } catch {
        // continue to next provider as fallback
      }
    }

    return null;
  }
}

export const postalCodeService = new PostalCodeService([
  new ViaCepProvider(),
  new BrasilApiProvider(),
]);

export async function lookupPostalCode(
  cep: string,
): Promise<PostalCodeLookupResult | null> {
  return postalCodeService.lookup(cep);
}
