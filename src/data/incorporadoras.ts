export interface Incorporadora {
  id: string;
  name: string;
  location?: string;
  description: string;
  website: string;
  logoUrl: string;
}

/**
 * Logos oficiais carregadas diretamente das páginas oficiais das marcas.
 * Quando o administrador cadastrar uma incorporadora pelo painel, esta lista
 * poderá ser substituída/estendida por dados armazenados no backend.
 */
export const incorporadoras: Incorporadora[] = [
  {
    id: 'ayoshii',
    name: 'A.Yoshii',
    description: 'Com mais de 55 anos de atuação, a A.Yoshii é referência em empreendimentos de alto padrão, combinando engenharia de excelência, arquitetura sofisticada e atenção aos detalhes.',
    website: 'https://www.ayoshii.com.br/',
    logoUrl: 'https://www.ayoshii.com.br/wp-content/themes/ayoshii/assets/images/logo.svg',
  },
  {
    id: 'plaenge',
    name: 'Plaenge',
    description: 'Reconhecida nacionalmente pela qualidade de seus projetos, a Plaenge combina tecnologia, sustentabilidade e design para desenvolver empreendimentos de alto padrão.',
    website: 'https://www.plaenge.com.br/',
    logoUrl: 'https://www.plaenge.com.br/wp-content/themes/plaenge/assets/images/logo.svg',
  },
  {
    id: 'tricon',
    name: 'Tricon',
    location: 'Curitiba/PR',
    description: 'Empreendimentos residenciais e comerciais com foco em localização estratégica, qualidade construtiva, acabamento superior e valorização.',
    website: 'https://construtoratricon.com.br/',
    logoUrl: 'https://construtoratricon.com.br/wp-content/uploads/2024/05/logo-tricon.png',
  },
  {
    id: 'helbor',
    name: 'Helbor',
    description: 'Uma das incorporadoras mais reconhecidas do Brasil, com empreendimentos que combinam localização, arquitetura, qualidade e experiência.',
    website: 'https://helbor.com.br/',
    logoUrl: 'https://helbor.com.br/wp-content/uploads/2023/10/logo-helbor.png',
  },
  {
    id: 'avantti',
    name: 'Grupo Avantti',
    description: 'Grupo com atuação no mercado imobiliário e foco em empreendimentos que unem arquitetura, qualidade e valorização.',
    website: 'https://www.grupoavantti.com/',
    logoUrl: 'https://www.grupoavantti.com/wp-content/uploads/2024/01/logo-avantti.png',
  },
];
