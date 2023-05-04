const template = document.createElement('template');

template.innerHTML = `
<div class="navbar">
<a class="active" href="index.html">Home</a>
<a href="faculty">Faculty</a>
<a href="paulsroom.html">Paul's Room</a>
</div>
`;

document.body.appendChild(template.content);
