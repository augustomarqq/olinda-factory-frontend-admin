import { buscarRelatosPorSetor, buscarSetorX, buscarSetores } from "../apiAccess.js";

document.addEventListener('DOMContentLoaded', () => {
    const setorIdInicial = localStorage.getItem('setor-id-atual');
    const dateFilter = document.getElementById('dateFilter');
    const problemasContainer = document.getElementById('problemasContainer');
    const h1Title = document.querySelector('h1');
    const pageTitle = document.querySelector('title');
    const setorFilter = document.getElementById('setorFilter');

    let relatos = [];

    async function carregarSetores() {
        try {
            const setores = await buscarSetores();
            setorFilter.innerHTML = setores.map(setor => 
                `<option value="${setor.id}">${setor.nome}</option>`
            ).join('');
            
            // Seleciona o setor inicial
            setorFilter.value = setorIdInicial;
        } catch (error) {
            console.error('Erro ao carregar setores:', error);
        }
    }

    async function carregarRelatos(setorId) {
        try {
            const setor = await buscarSetorX(setorId);
            const setorNome = setor.nome;

            pageTitle.textContent = `Problemas do Setor ${setorNome}`;
            h1Title.textContent = `Problemas do Setor ${setorNome}`;

            relatos = await buscarRelatosPorSetor(setorId);
            exibirRelatos();
        } catch (error) {
            console.error('Erro ao carregar relatos:', error);
            problemasContainer.innerHTML = '<p class="text-danger">Erro ao carregar os dados. Por favor, tente novamente mais tarde.</p>';
        }
    }

    function exibirRelatos(dataFiltro = null) {
        problemasContainer.innerHTML = '';
        let relatosFiltrados = relatos;

        if (dataFiltro) {
            relatosFiltrados = relatos.filter(relato => relato.data === dataFiltro);
        }

        if (relatosFiltrados.length === 0) {
            problemasContainer.innerHTML = '<p class="text-center">Não há problemas relatados para este período.</p>';
            return;
        }

        relatosFiltrados.forEach(relato => {
            const card = document.createElement('div');
            card.className = 'col-md-4';
            card.innerHTML = `
                <div class="card mb-3">
                    <div class="card-body">
                        <h5 class="card-title">Problema: ${relato.problema.descricao}</h5>
                        <p class="card-text">Data: ${relato.data}</p>
                    </div>
                </div>
            `;
            problemasContainer.appendChild(card);
        });
    }

    dateFilter.addEventListener('change', (e) => {
        exibirRelatos(e.target.value);
    });

    setorFilter.addEventListener('change', (e) => {
        const novoSetorId = e.target.value;
        localStorage.setItem('setor-id-atual', novoSetorId);
        carregarRelatos(novoSetorId);
    });

    async function inicializar() {
        await carregarSetores();
        carregarRelatos(setorIdInicial);
    }

    inicializar();
});