// src/lib/heroSlides.js
// -----------------------------------------------------------------------------
// Slides da capa (Hero) — o carrossel monta um slide para cada item desta lista,
// na ordem em que aparecem aqui. Cada slide tem sua própria imagem, frase de
// efeito e citação, que trocam JUNTAS (nunca defasadas).
//
// COMO ADICIONAR / TROCAR UM SLIDE:
//   1. Coloque a imagem em `public/` — de preferência uma versão `.webp` leve
//      (o componente também procura um `.jpg` de mesmo nome como reserva para
//      navegadores antigos; se não existir, não tem problema).
//   2. Adicione ou edite um objeto abaixo. `imagem` aponta para o arquivo em
//      `public/` (use o caminho começando com `/`).
//   3. Pronto: o carrossel se ajusta sozinho ao número de slides (as bolinhas
//      de navegação aparecem automaticamente).
//
// As frases/citações abaixo são PLACEHOLDERS temáticos — troque pelos seus
// textos reais quando quiser. As imagens hero-1..hero-4 são as que você enviou.
// -----------------------------------------------------------------------------

export const HERO_SLIDES = [
  {
    imagem: '/hero-1.webp', // cavaleiro conquistador (figura à direita)
    frase: 'O sinal em meio ao ruído',
    citacao: 'O futuro já chegou. Só não está igualmente distribuído.',
    autorCitacao: 'William Gibson',
  },
  {
    imagem: '/hero-2.webp', // estátua com a espada erguida (chamado à ação)
    frase: 'A coragem de olhar adiante',
    citacao: 'A melhor maneira de prever o futuro é inventá-lo.',
    autorCitacao: 'Alan Kay',
  },
  {
    imagem: '/hero-3.webp', // horizonte de eventos / buraco negro
    frase: 'Além do horizonte de eventos',
    citacao: 'Qualquer tecnologia suficientemente avançada é indistinguível de magia.',
    autorCitacao: 'Arthur C. Clarke',
  },
  {
    imagem: '/hero-4.webp', // à frente do exército (a vanguarda)
    frase: 'Na vanguarda da próxima fronteira',
    citacao: 'A ciência é uma maneira de tentar não enganar a si mesmo.',
    autorCitacao: 'Richard Feynman',
  },
];
