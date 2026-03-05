# Filler Skip

Site interativo que **busca e exibe os episódios filler** de animes — ou seja, os episódios que **não fazem parte da história principal** e podem ser pulados sem prejudicar o entendimento do enredo.

---

## O que o sistema faz

- **Busca por anime** — Você digita o nome do anime e o sistema consulta uma base de dados e mostra quais episódios são filler, canon (do mangá) ou anime canon (história original do anime).
- **Autocomplete na busca** — Ao digitar, aparece uma lista de sugestões de animes. Basta escolher um para ver a lista de episódios.
- **Timeline visual** — Uma faixa em que cada quadrado representa um episódio, colorido por tipo: **Laranja** = Filler (pode pular), **Verde** = Canon / Misto, **Roxo** = Anime canon.
- **Abas por tipo** — Três abas: Só Filler, Canon / Misto, Anime Canon.
- **Copiar lista de fillers** — Botão para copiar os números dos episódios filler para a área de transferência.
- **Atalhos (chips)** — Animes populares com um clique.

## Como rodar

Abra o arquivo `index.html` no navegador. Não é necessário servidor nem instalação.

## Tecnologias

- HTML, CSS e JavaScript. Dados: [Anime Filler List API](https://anime-filler.vercel.app/api/anime) e [ChaiWala Filler API](https://filler-list.chaiwala-anime.workers.dev/). Fonte: [animefillerlist.com](https://www.animefillerlist.com/).
