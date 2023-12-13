//search 구현 안되는 중 고쳐야되는 코드
const searchButton = document.querySelector('.search-button');
const searchInput = document.querySelector('.search-bar');

searchButton.addEventListener('click', (event) => {
  event.preventDefault(); 
  const searchTerm = searchInput.value;

  fetch(`/board/search?q=${searchTerm}`)
    .then(response => response.json())
    .then(data => {
      console.log(data);
    })
    .catch(error => {
      console.error('Error:', error);
    });
});


