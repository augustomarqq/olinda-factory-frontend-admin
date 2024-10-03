import { buscarSetores, criarSetor, criarFuncionario, buscarRelatos, buscarRelatosPorSetor } from "/apiAccess.js";

const setoresContainer = document.querySelector(".cards-container");
const addSetorForm = document.querySelector("#addSetorForm");
const addFuncionarioForm = document.querySelector("#addFuncionarioForm");
const setorNomeInput = document.querySelector("#setorNome");
const funcionarioNomeInput = document.querySelector("#funcionarioNome");
const funcionarioSetorSelect = document.querySelector("#funcionarioSetor");
const funcionarioCargoSelect = document.querySelector("#funcionarioCargo");

document.addEventListener('DOMContentLoaded', () => {
    renderizarSetores();
    carregarSetoresNoSelect();
    renderizarResumoProblemaPorDescricao();
});

async function renderizarSetores() {
    let setores = await buscarSetores();
    
    if (setores.length === 0) {
        setoresContainer.innerHTML = "<h1>Não existem setores cadastrados</h1>";
    } else {
        setoresContainer.innerHTML = '';
        setores.forEach(e => {
            const card = document.createElement('div');
            const cardBody = document.createElement('div');
            const cardText = document.createElement('p');
    
            card.classList.add('card', 'm-4');
            card.style.width = '12rem';
            card.style.cursor = 'pointer';
    
            cardBody.classList.add('card-body');
            cardText.classList.add('card-text', 'text-center');
    
            cardText.textContent = e.nome;
    
            card.setAttribute('setorId', e.id);
            card.setAttribute('setorNome', e.nome);
            cardBody.appendChild(cardText);
            card.appendChild(cardBody);
            setoresContainer.appendChild(card);
    
            card.addEventListener('click', (e) => {
                localStorage.setItem("setor-id-atual", e.currentTarget.getAttribute("setorId"));
                window.location.replace('./setorProblemas/setorProblemas.html');
            });
        });
    }
}

async function renderizarResumoProblemaPorDescricao() {
    const resumoContainer = document.getElementById('problem-summary-container');
    resumoContainer.innerHTML = '';
    
    const filterWrapper = document.createElement('div');
    filterWrapper.className = 'd-flex flex-column align-items-center mb-3';

    const filterRow = document.createElement('div');
    filterRow.className = 'd-flex justify-content-center gap-3 mb-2';

    const setorFilterDiv = document.createElement('div');
    setorFilterDiv.className = 'd-flex flex-column align-items-center';

    const setorLabel = document.createElement('label');
    setorLabel.setAttribute('for', 'setorFilter');
    setorLabel.textContent = 'Filtrar por setor';
    setorLabel.className = 'form-label text-center mb-2';

    const setorFilter = document.createElement('select');
    setorFilter.id = 'setorFilter';
    setorFilter.className = 'form-select';
    setorFilter.style.width = '200px';

    setorFilterDiv.appendChild(setorLabel);
    setorFilterDiv.appendChild(setorFilter);

    const dateFilterDiv = document.createElement('div');
    dateFilterDiv.className = 'd-flex flex-column align-items-center';

    const dateLabel = document.createElement('label');
    dateLabel.setAttribute('for', 'dateFilter');
    dateLabel.textContent = 'Filtrar por data';
    dateLabel.className = 'form-label text-center mb-2';

    const dateFilter = document.createElement('input');
    dateFilter.type = 'date';
    dateFilter.id = 'dateFilter';
    dateFilter.className = 'form-control';
    dateFilter.style.width = '200px';

    dateFilterDiv.appendChild(dateLabel);
    dateFilterDiv.appendChild(dateFilter);

    filterRow.appendChild(setorFilterDiv);
    filterRow.appendChild(dateFilterDiv);

    filterWrapper.appendChild(filterRow);

    const cardContainer = document.createElement('div');
    cardContainer.className = 'row justify-content-center';

    resumoContainer.appendChild(filterWrapper);
    resumoContainer.appendChild(cardContainer);

    try {
        const setores = await buscarSetores();
        setorFilter.innerHTML = '<option value="">Todos os setores</option>';
        setores.forEach(setor => {
            const option = document.createElement('option');
            option.value = setor.id;
            option.textContent = setor.nome;
            setorFilter.appendChild(option);
        });

        async function atualizarContagem(setorId = '', data = null) {
            let relatosFiltrados;
            
            if (setorId) {
                relatosFiltrados = await buscarRelatosPorSetor(setorId);
            } else {
                relatosFiltrados = await buscarRelatos();
            }

            if (data) {
                relatosFiltrados = relatosFiltrados.filter(relato => relato.data === data);
            }

            const contagem = {};
            relatosFiltrados.forEach(relato => {
                const descricao = relato.problema.descricao;
                contagem[descricao] = (contagem[descricao] || 0) + 1;
            });

            cardContainer.innerHTML = '';
            
            if (Object.keys(contagem).length === 0) {
                const mensagem = document.createElement('div');
                mensagem.className = 'col-12 text-center';
                mensagem.innerHTML = '<h4>Não há problemas relatados para este período.</h4>';
                cardContainer.appendChild(mensagem);
            } else {
                Object.entries(contagem).forEach(([descricao, count]) => {
                    const card = document.createElement('div');
                    card.className = 'col-sm-6 col-md-4 col-lg-2 mb-3';
                    card.innerHTML = `
                        <div class="card">
                            <div class="card-body">
                                <h5 class="card-title text-center">${descricao}</h5>
                                <p class="card-text text-center display-4">${count}</p>
                            </div>
                        </div>
                    `;
                    cardContainer.appendChild(card);
                });
            }
        }

        setorFilter.addEventListener('change', (e) => {
            atualizarContagem(e.target.value, dateFilter.value);
        });

        dateFilter.addEventListener('change', (e) => {
            atualizarContagem(setorFilter.value, e.target.value);
        });

        atualizarContagem();
    } catch (error) {
        console.error('Erro ao buscar ou processar dados:', error);
        cardContainer.innerHTML = '<p class="text-danger">Erro ao carregar dados. Por favor, tente novamente mais tarde.</p>';
    }
}

async function carregarSetoresNoSelect() {
    let setores = await buscarSetores();

    funcionarioSetorSelect.innerHTML = '';

    setores.forEach(e => {
        const option = document.createElement('option');
        option.value = e.id;
        option.textContent = e.nome;
        funcionarioSetorSelect.appendChild(option);
    });
}

addSetorForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const setorNome = setorNomeInput.value.trim();
    
    if (setorNome) {
        try {
            await criarSetor(setorNome);
            alert('Setor cadastrado com sucesso!');
            renderizarSetores();
            carregarSetoresNoSelect();
            const modal = bootstrap.Modal.getInstance(document.getElementById('addSetorModal'));
            modal.hide();
        } catch (error) {
            console.error('Erro ao cadastrar setor:', error);
        }
    } else {
        alert('Por favor, insira um nome válido para o setor.');
    }
});

addFuncionarioForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const funcionarioNome = funcionarioNomeInput.value.trim();
    const setorId = funcionarioSetorSelect.value;
    const cargo = funcionarioCargoSelect.value;

    if (funcionarioNome && setorId && cargo) {
        try {
            await criarFuncionario(funcionarioNome, setorId, cargo);
            alert('Funcionário cadastrado com sucesso!');
            // Fecha o modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('addFuncionarioModal'));
            modal.hide();
        } catch (error) {
            console.error('Erro ao cadastrar funcionário:', error);
        }
    } else {
        alert('Por favor, preencha todos os campos.');
    }
});
