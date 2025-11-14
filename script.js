// =========================
// 🔵 Carregar posts do Netlify CMS (arquivos .md dentro de /posts)
// =========================

async function carregarPosts() {
  const feed = document.getElementById("feed");

  try {
    // Pega lista de arquivos dentro da pasta /posts
    const resposta = await fetch('/posts');
    const texto = await resposta.text();

    const parser = new DOMParser();
    const html = parser.parseFromString(texto, 'text/html');

    // Filtra links que terminam com .md
    const arquivos = [...html.querySelectorAll('a')]
      .filter(a => a.href.endsWith('.md'));

    for (let arquivo of arquivos) {
      const req = await fetch(arquivo.href);
      const md = await req.text();

      // Extrai frontmatter (title, date, image)
      const frontmatterRegex = /---([\s\S]*?)---/;
      const fm = frontmatterRegex.exec(md);

      let meta = {};
      let conteudo = md;

      if (fm) {
        const yaml = fm[1].trim();
        conteudo = md.replace(frontmatterRegex, "");

        yaml.split("\n").forEach(linha => {
          const [key, ...rest] = linha.split(":");
          meta[key.trim()] = rest.join(":").trim().replace(/"/g, "");
        });
      }

      const resumo = conteudo.substring(0, 150) + "...";

      // Cria o card do post
      const post = document.createElement("div");
      post.classList.add("post");

      post.innerHTML = `
        ${meta.image ? `<img src="${meta.image}" alt="${meta.title}">` : ""}
        <div class="post-content">
          <h4>${meta.title}</h4>
          <p>${resumo}</p>
          <small>${meta.date}</small>
        </div>
      `;

      feed.appendChild(post);
    }

  } catch (e) {
    feed.innerHTML = "<p>Erro ao carregar posts.</p>";
  }
}

window.addEventListener("DOMContentLoaded", carregarPosts);
