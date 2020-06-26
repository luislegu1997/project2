
document.querySelector('form').addEventListener('submit', function (e){

	const input = document.querySelector('input').value

	localStorage.setItem('user', input);


});





