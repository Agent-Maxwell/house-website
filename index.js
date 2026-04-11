const template = document.createElement('template');

template.innerHTML = `
<div class="navbar">
<a href="/index.html">Home</a>
<a href="/faculty/faculty.html">Faculty</a>
<a href="/comments.html">Comments</a>
<a href="/paulpages/paulsroom.html">Paul's Room</a>
<a href="/adrianpages/adriansroom.html">Adrian's Room</a>
<a href="/lilypages/lilysroom.html">Lily's Room</a>
<a href="/davidpages/index.html">David's Room</a>
<a href="/avapages/index.html">Ava's Room</a>
<a href="/opheliapages/index.html">Ophelia's Room</a>
<a href="/gavinpages/index.html">Gavin's Room</a>
</div>

<br>
`;

document.body.prepend(template.content);
