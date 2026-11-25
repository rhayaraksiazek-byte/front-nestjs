
function abrirTab(index) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));

    document.querySelectorAll('.tab-content')[index].classList.add('active');
    document.querySelectorAll('.tab-btn')[index].classList.add('active');

    if (index === 0) {
        listarAlunos();
    }
}

function formatarResposta(resultado) {
    if (resultado.erro) {
        return `<div style="color: #721c24; padding: 15px; background: #f8d7da; border: 1px solid #f5c6cb; border-radius: 5px; font-weight: bold;">
                            ⚠️ Erro: ${resultado.erro}
                        </div>`;
    }

    let html = `<div style="padding: 15px; background: #d4edda; color: #155724; border: 1px solid #c3e6cb; border-radius: 5px;">`;
    html += `<h3 style="margin-top: 0; margin-bottom: 15px; border-bottom: 1px solid #c3e6cb; padding-bottom: 5px;">✅ Sucesso</h3>`;
    html += `<ul style="list-style-type: none; padding-left: 0; margin: 0;">`;

    for (const [key, value] of Object.entries(resultado)) {
        // Capitaliza a primeira letra e ajusta o nome (ex: imc -> IMC)
        let label = key.charAt(0).toUpperCase() + key.slice(1);
        if (key.toLowerCase() === 'imc') label = 'IMC';

        html += `<li style="margin-bottom: 8px; font-size: 16px;">
                            <strong style="color: #0b2e13;">${label}:</strong> ${value}
                         </li>`;
    }

    html += `</ul></div>`;
    return html;
}

async function cadastrarAluno() {
    const dados = {
        nome: document.getElementById("aluno_nome").value,
        email: document.getElementById("aluno_email").value,
        matricula: document.getElementById("aluno_matricula").value,
        dataNascimento: document.getElementById("aluno_dataNascimento").value
    };

    try {
        const res = await fetch("http://localhost:3000/alunos", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(dados)
        });

        const resultado = await res.json();
        document.getElementById("resultadoAluno").innerHTML = formatarResposta(resultado);
    } catch (erro) {
        document.getElementById("resultadoAluno").innerHTML = formatarResposta({ erro: "Falha na comunicação com o servidor." });
    }
}




async function listarAlunos() {
    // Limpar o input de busca
    const buscaInput = document.getElementById("busca_nome");
    if (buscaInput) buscaInput.value = "";

    try {
        const res = await fetch("http://localhost:3000/alunos");
        const alunos = await res.json();
        renderizarAlunos(alunos);
    } catch (erro) {
        const container = document.getElementById("listaAlunos");
        if (container) {
            container.innerHTML = `<div style="color: #721c24; padding: 15px; background: #f8d7da; border: 1px solid #f5c6cb; border-radius: 5px;">⚠️ Falha ao carregar clientes do servidor.</div>`;
        }
    }
}

async function buscarAlunos() {
    const nomeBusca = document.getElementById("busca_nome").value.trim();
    if (!nomeBusca) {
        listarAlunos();
        return;
    }

    try {
        const res = await fetch("http://localhost:3000/alunos");
        const alunos = await res.json();
        
        // Filtrar pelo CPF ignorando caracteres não numéricos
        const nomeLimpo = nomeBusca.trim().toLowerCase();
        const filtrados = alunos.filter(aluno => aluno.nome && aluno.nome.trim().toLowerCase() === nomeLimpo);
        renderizarAlunos(filtrados);
    } catch (erro) {
        const container = document.getElementById("listaAlunos");
        if (container) {
            container.innerHTML = `<div style="color: #721c24; padding: 15px; background: #f8d7da; border: 1px solid #f5c6cb; border-radius: 5px;">⚠️ Falha ao buscar cliente.</div>`;
        }
    }
}

function renderizarAlunos(alunos) {
    const container = document.getElementById("listaAlunos");
    if (!container) return;

    if (!alunos || alunos.length === 0) {
        container.innerHTML = `<div class="no-aluno">Nenhum aluno encontrado.</div>`;
        return;
    }

    let html = "";
    alunos.forEach(aluno => {
        html += `
            <div class="aluno-card">
                <h3>${aluno.nome || 'Sem Nome'}</h3>
                <p><strong>email:</strong> ${aluno.email || '-'}</p>
                <p><strong>matricula:</strong> ${aluno.matricula || '-'}
                <p><strong>dataNascimento:</strong> ${aluno.dataNascimento || '-'}</p>
            </div>
        `;
    });
    container.innerHTML = html;
}

// Carregar lista de clientes automaticamente ao abrir index.html
if (window.location.pathname.endsWith('index.html') && localStorage.getItem('token')) {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', listarAlunos);
    } else {
        listarAlunos();
    }
}