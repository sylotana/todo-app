/* ==================== *\
  Форма, список задач
\* ==================== */
const TASKS = [
  {
    _uid: 'c2d51e099c374582a7e46fc90981cee4',
    title: 'Apply These 9 Secret Techniques To Improve Asdasdasd',
    body: 'Failures make you history better only if you understand these 5 things',
    completed: false, },
  {
    _uid: '7315284a4c224668953aa41902439354',
    title: 'Believing These 9 Myths About Asdasdasd Keeps You From Growing',
    body: 'Haven\'t you heard about the recession: topten reasons why you should history',
    completed: true, },
  {
    _uid: '3c3cb85939574557a90940dc3155c9ad',
    title: 'Don\'t Waste Time! 9 Facts Until You Reach Your Asdasdasd',
    body: 'Here are 5 ways to history better',
    completed: false, },
  {
    _uid: '4050f12fd61e4b469c3f224ac1b6b49b',
    title: 'How 9 Things Will Change The Way You Approach Asdasdasd',
    body: 'Here are 5 ways to history faster',
    completed: true, },
  {
    _uid: '9ab06f86c4a444d199593cd8ff1a1feb',
    title: 'Asdasdasd Awards: 9 Reasons Why They Don\'t Work & What You Can Do About It',
    body: 'Here are 5 ways to history',
    completed: false, },
];

(function(arrOfTasks) {
  // массив не самый удобный инструмент, поэтому переводим его в объект
  const objOfTasks = arrOfTasks.reduce((acc, task) => {
    acc[task._uid] = task;
    return acc;
  }, {});

  // Elements UI
  const listContainer = document.querySelector('.tasks-list-section .list-group');
  const form = document.forms['addTask']; // с помощью forms получаем коллекцию всех форм на странице
  const inputTitle = form.elements['title'];
  const inputBody = form.elements['body'];


  // Events
  renderAllTasks(objOfTasks);
  form.addEventListener('submit', onFormSubmitHandler);
  listContainer.addEventListener('click', onDeleteHandler);


  // Functions
  function renderAllTasks(tasksList) {
    if (!tasksList) { // проверяем передали ли задачи
      console.error('Передайте список задач');
      return;
    }

    const fragment = document.createDocumentFragment(); // создаем фрагмент
    Object.values(tasksList).forEach(task => {
      // Object.values возвращает значение объекта в виде массива 
      const li = listItemTemplate(task);
      fragment.appendChild(li);
    });

    listContainer.appendChild(fragment);
  }

  function listItemTemplate({_uid, title, body} = {}) {
    // создаем разметку
    const li = document.createElement('li');
    li.classList.add('list-group-item', 'd-flex', 'align-items-center', 'flex-wrap', 'mt-2');
    li.setAttribute('data-task-id', _uid);
    
    // создаем заголовок статьи
    const span = document.createElement('span');
    span.textContent = title;
    span.style.fontWeight = 'bold';

    // создаем кнопку
    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Delete task';
    deleteBtn.classList.add('btn', 'btn-danger', 'ml-auto', 'delete-button');
    deleteBtn.setAttribute('type', 'button');

    // создаем описание статьи
    const article = document.createElement('p');
    article.textContent = body;
    article.classList.add('mt-2', 'w-100');

    // добавляем внутрь li, созданные элементы
    li.appendChild(span);
    li.appendChild(article);
    li.appendChild(deleteBtn);

    return li; // возвращаем разметку
  }

  function onFormSubmitHandler(event) {
    event.preventDefault(); // Убрали действие по умолчанию
    // получаем значения из инпутов
    const titleValue = inputTitle.value; 
    const bodyValue = inputBody.value; 
    
    // простая проверка на пустое значение
    if (!titleValue || !bodyValue) {
      alert('Пожалуйста введите title и body')
      return;
    }

    const task = createNewTask(titleValue, bodyValue);
    const listItem = listItemTemplate(task);
    listContainer.insertAdjacentElement('afterbegin', listItem);
    form.reset();
  }

  function createNewTask(title, body) {
    const newTask = {
      title,
      body,
      completed: false,
      _uid: `task-${Math.random()}`
    }

    objOfTasks[newTask._uid] = newTask;

    return { ...newTask };
  }

  function deleteTask(id) {
    const {title} = objOfTasks[id];
    const isConfirm = confirm(`Вы действительно хотите удалить задачу: ${title}?`); // если OK, то isConfirm = true
    if (!isConfirm) return isConfirm;
    delete objOfTasks[id];
    return isConfirm;
  }

  function deleteTaskFromHTML(confirmed, element) {
    if (!confirmed) return;
    element.remove();
  }

  function onDeleteHandler({ target }) {
    
    if (target.classList.contains('delete-button')) {
      const parent = target.closest('[data-task-id]');
      const id = parent.dataset.taskId;  
      const confirmed = deleteTask(id);

      deleteTaskFromHTML(confirmed, parent);

    }
  }
})(TASKS);