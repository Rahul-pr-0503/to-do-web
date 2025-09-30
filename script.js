const tasks = [];

    function addTask() {
      const text = document.getElementById('taskText').value.trim();
      const date = document.getElementById('taskDate').value;
      const listType = document.getElementById('taskListSelect').value;
      const email = document.getElementById('userEmail').value.trim();

      if (!text || !email) {
        alert("Please enter both task and email");
        return;
      }

      const li = document.createElement('li');

      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.onchange = () => li.classList.toggle('completed', checkbox.checked);

      const details = document.createElement('div');
      details.className = 'task-details';

      const span = document.createElement('span');
      span.textContent = text;

      const dateEl = document.createElement('small');
      dateEl.className = 'task-date';
      if (date) dateEl.textContent = new Date(date).toLocaleString();

      details.appendChild(span);
      details.appendChild(dateEl);

      const actions = document.createElement('div');
      actions.className = 'actions';

      const editBtn = document.createElement('button');
      editBtn.textContent = 'Edit';
      editBtn.className = 'edit';
      editBtn.onclick = () => editTask(span, editBtn);

      const delBtn = document.createElement('button');
      delBtn.textContent = 'Delete';
      delBtn.className = 'delete';
      delBtn.onclick = () => li.remove();

      actions.appendChild(editBtn);
      actions.appendChild(delBtn);

      li.appendChild(checkbox);
      li.appendChild(details);
      li.appendChild(actions);

      document.getElementById(listType + 'List').appendChild(li);

      // Save task with user email for reminders
      if (date) {
        tasks.push({ text, date: new Date(date), email, alerted: false });
      }

      document.getElementById('taskText').value = '';
      document.getElementById('taskDate').value = '';
    }

    function editTask(span, button) {
      if (button.textContent === 'Edit') {
        const input = document.createElement('input');
        input.type = 'text';
        input.value = span.textContent;
        span.replaceWith(input);
        button.textContent = 'Save';
        button.className = 'save';
        button.onclick = () => saveTask(input, button);
      }
    }

    function saveTask(input, button) {
      const span = document.createElement('span');
      span.textContent = input.value;
      input.replaceWith(span);
      button.textContent = 'Edit';
      button.className = 'edit';
      button.onclick = () => editTask(span, button);
    }

    // Check reminders every minute
    setInterval(() => {
      const now = new Date();
      tasks.forEach(task => {
        if (!task.alerted) {
          const diff = (task.date - now) / 60000; // minutes
          if (diff > 0 && diff <= 10) {
            // Send email with EmailJS
            emailjs.send("service_fo9u3uh", "template_jgv1at1", {
              task: task.text,
              date: task.date.toLocaleString(),
              to_email: task.email
            }).then(() => {
              console.log("Email sent successfully to " + task.email);
            }).catch(err => {
              console.error("EmailJS Error:", err);
            });

            task.alerted = true;
          }
        }
      });
    }, 60000);