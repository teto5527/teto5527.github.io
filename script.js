// Project filter: shows projects whose data-tags include the chosen class.
const buttons = document.querySelectorAll('.filter button');
const projects = document.querySelectorAll('.project');

buttons.forEach((button) => {
  button.addEventListener('click', () => {
    const filter = button.dataset.filter;
    buttons.forEach((b) => b.setAttribute('aria-pressed', String(b === button)));
    projects.forEach((project) => {
      const tags = project.dataset.tags.split(' ');
      project.hidden = filter !== 'all' && !tags.includes(filter);
    });
  });
});
