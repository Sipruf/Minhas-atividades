
let tasks = [];
let tasksLoaded = false;
let activeTask = null;

function saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
}

// Carrega as tarefas do localStorage
function loadTasks() {
    if (!tasksLoaded) {
        tasks = JSON.parse(localStorage.getItem("tasks")) || [];
        tasksLoaded = true;
    }
    if (tasks.length > 0) {
        renderTasks();
    }
    renderTasks();
}
        function addTask() {
            const taskNameInput = document.getElementById("taskName");
            const taskDescInput = document.getElementById("taskDesc");
            const taskName = taskNameInput.value;
            const taskDesc = taskDescInput.value;
            
            if (taskName.trim() === "" || taskDesc.trim() === ""){
                alert("Por favor, preencha todos os campos antes de adicionar uma atividade.")
                return;
            }

            if (tasks.some(task => task.name === taskName)) {
                alert("Já existe uma atividade com este código ou nome.");
                return;
            }

            const task = {
                id: Date.now(),
                name: taskName,
                desc: taskDesc,
                time: 0,
                timer: null
            };
            tasks.push(task);
            renderTasks();
            saveTasks();
            
            taskNameInput.value = "";
            taskDescInput.value = "";
        }
        
        // Renderizar as tarefas
        function renderTasks() {
            const taskList = document.getElementById("taskList");
            taskList.innerHTML = "";
            tasks.forEach(task => {
                const taskElement = document.createElement("div");
                taskElement.classList.add("task");
                taskElement.innerHTML = `
                    <h3>${task.name}</h3>
                    <p>${task.desc}</p>
                    <span class="time" id="time-${task.id}">${formatTime(task.time)}</span>
                    <div class="buttons">
                        <button onclick="toggleTimer(${task.id})">Iniciar/Pausar</button>
                        <button onclick="editTask(${task.id})">Editar</button>
                        <button onclick="removeTask(${task.id})">Excluir</button>
                    </div>
                `;
                taskList.appendChild(taskElement);
            });
        }
        
        //Timer das atividades
        function toggleTimer(id) {
            const task = tasks.find(t => t.id === id);
            if (!task) return;
            
            if (task.isRunning) {
                // Pausar o timer
                clearInterval(task.intervalId);
                task.isRunning = false;
                task.endTime = Date.now();
                
                // Calcular e salvar o tempo decorrido
                const elapsedTime = Math.floor((task.endTime - task.startTime) / 1000);
                task.time += elapsedTime;
                
                // Atualizar o texto do tempo
                const timeDisplay = document.getElementById(`time-${task.id}`);
                task.timeText = timeDisplay.innerText;
                
                // Salvar o estado no localStorage
                saveTaskToLocalStorage(task);
                
                activeTask = null;
            } else {
                // Verificar se há outra tarefa ativa
                if (activeTask !== null) {
                    alert("Pause a atividade atual antes de iniciar outra.");
                    return;
                }
        
                // Iniciar o timer
                activeTask = task;
                task.isRunning = true;
                task.startTime = Date.now();
                
                // Configurar intervalo para atualizar o tempo
                task.intervalId = setInterval(() => {
                    const currentTime = Date.now();
                    const elapsedTime = Math.floor((currentTime - task.startTime) / 1000);
                    const totalTime = task.time + elapsedTime;
                    
                    const timeText = formatTime(totalTime);
                    document.getElementById(`time-${task.id}`).innerText = timeText;
                }, 1000);
            }
        }
        
        // Salvar a tarefa no localStorage
        function saveTaskToLocalStorage(task) {
            const taskData = {
                id: task.id,
                time: task.time,
                isRunning: task.isRunning,
                startTime: task.startTime,
                endTime: task.endTime,
                timeText: task.timeText || formatTime(task.time)
            };
            localStorage.setItem(`task-${task.id}`, JSON.stringify(taskData));
        }
        
        // Carregar a tarefa do localStorage
        function loadTaskFromLocalStorage(task) {
            const savedTaskData = localStorage.getItem(`task-${task.id}`);
            if (savedTaskData) {
                const taskData = JSON.parse(savedTaskData);
                task.time = taskData.time;
                task.isRunning = taskData.isRunning;
                task.timeText = taskData.timeText;
                
                // Atualizar o texto do tempo na interface
                const timeDisplay = document.getElementById(`time-${task.id}`);
                if (timeDisplay) {
                    timeDisplay.innerText = task.timeText;
                }
                
                if (task.isRunning) {
                    task.startTime = Date.now();
                    task.intervalId = setInterval(() => {
                        const currentTime = Date.now();
                        const elapsedTime = Math.floor((currentTime - task.startTime) / 1000);
                        const totalTime = task.time + elapsedTime;
                        
                        const timeText = formatTime(totalTime);
                        document.getElementById(`time-${task.id}`).innerText = timeText;
                    }, 1000);
                    
                    activeTask = task;
                }
            }
        }
        
        // Inicializar as tarefas
        function initializeTasks() {
            tasks.forEach(task => {
                // Garantir o timeText
                if (!task.timeText) {
                    task.timeText = formatTime(task.time || 0);
                }
                loadTaskFromLocalStorage(task);
            });
        }
        
        // Carregar o estado das tarefas quando a página for carregada
        window.addEventListener('load', initializeTasks);
        
        // Salva as informações da tarefa antes de fechar a janela
        window.addEventListener('beforeunload', () => {
            if (activeTask) {
                const timeDisplay = document.getElementById(`time-${activeTask.id}`);
                if (timeDisplay) {
                    activeTask.timeText = timeDisplay.innerText;
                }
                saveTaskToLocalStorage(activeTask);
            }
        });
        
        // Formatar o tempo
        function formatTime(totalSeconds) {
            const hours = Math.floor(totalSeconds / 3600);
            const minutes = Math.floor((totalSeconds % 3600) / 60);
            const seconds = totalSeconds % 60;
            return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
        
        // Editar a tarefa
        function editTask(id) {
            const task = tasks.find(t => t.id === id);
            if (!task) return;
            
            const newDesc = prompt("Editar descrição:", task.desc);
            if (newDesc !== null) {
                task.desc = newDesc.substring(0, 100);
                renderTasks();
            }
        }
        
        // Remover a tarefa
        function removeTask(id) {
            tasks = tasks.filter(t => t.id !== id);
            saveTasks();
            renderTasks();
            if (activeTask && activeTask.id === id) {
                activeTask = null;
            }
        }
        
        // Gerar relatório
        function generateReport() {
            const data = new Date().toLocaleDateString('pt-BR');
            if (tasks.length === 0) {
                alert("Nenhuma atividade foi adicionada.");
                return; 
              }
            if (tasks.some(task => task.timer !== null)) {
                alert("Pause todas as atividades antes de gerar o relatório.");
                return;
            }
            
            let report = `Atividades do dia ${data}\n\n`;;
            tasks.forEach(task => {
                report += `Código: ${task.name}\nDescrição: ${task.desc}\nTempo: ${formatTime(task.time)}\n\n`;
            });
            
            navigator.clipboard.writeText(report).then(() => {
                alert("Relatório copiado para a área de transferência!");
            }).catch(err => {
                alert("Erro ao copiar relatório: " + err);
            });
        }
    

        if ("serviceWorker" in navigator) {
            window.addEventListener("load", () => {
              navigator.serviceWorker
                .register("/service-worker.js")
                .then(() => console.log("Service Worker registrado com sucesso!"))
                .catch(error => console.log("Erro ao registrar Service Worker:", error));
            });
          }
          