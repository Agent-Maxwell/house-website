const template = document.createElement('template');

template.innerHTML = `
<div class="navbar">
<a class="active" href="https://gayhouse.online/index.html">Home</a>
<a href="https://gayhouse.online/faculty.html">Faculty</a>
<a href="https://gayhouse.online/comments.html">Comments</a>
<a href="https://gayhouse.online/paulpages/paulsroom.html">Paul's Room</a>
<a href="https://gayhouse.online/adrianpages/adriansroom.html">Adrian's Room</a>
<a href="https://gayhouse.online/lilypages/lilysroom.html">Lily's Room</a>
<a href="https://gayhouse.online/davidpages/davidsroom.html">davids room</a>
</div>

<br>
`;

document.body.prepend(template.content);
