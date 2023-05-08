const template = document.createElement('template');

template.innerHTML = `
<div class="navbar">
<a class="active" href="index.html">Home</a>
<a href="faculty.html">Faculty</a>
<a href="comments.html">Comments</a>
<a href="paulsroom.html">Paul's Room</a>
<a href="adriansroom.html">Adrian's Room</a>
<a href="lilysroom.html">Lily's Room</a>
<a href="davidpages/davidsroom.html">davids room</a>
</div>

<br>
`;

document.body.prepend(template.content);
