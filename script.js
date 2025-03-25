
let tasks = [];
let tasksLoaded = false;
let activeTask = null;

function saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
}

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
            
            taskNameInput.value = "";
            taskDescInput.value = "";
        }
        
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
        
        function toggleTimer(id) {
            const task = tasks.find(t => t.id === id);
            if (!task) return;
            
            if (task.timer) {
                clearInterval(task.timer);
                activeTask = null;
                task.timer = null;
            } else {

                if (activeTask !== null) {
                    alert("Pause a atividade atual antes de iniciar outra.");
                    return;
                }

                activeTask = task;
                task.timer = setInterval(() => {
                    task.time++;
                    saveTasks();
                    document.getElementById(`time-${task.id}`).innerText = formatTime(task.time);
                }, 1000);
            }
        }
        
        function editTask(id) {
            const task = tasks.find(t => t.id === id);
            if (!task) return;
            
            const newDesc = prompt("Editar descrição:", task.desc);
            if (newDesc !== null) {
                task.desc = newDesc.substring(0, 100);
                renderTasks();
            }
        }
        
        function removeTask(id) {
            tasks = tasks.filter(t => t.id !== id);
            renderTasks();
        }
        
        function formatTime(seconds) {
            const hours = Math.floor(seconds / 3600).toString().padStart(2, '0');
            const minutes = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
            const sec = (seconds % 60).toString().padStart(2, '0');
            return `${hours}:${minutes}:${sec}`;
        }
        
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
    