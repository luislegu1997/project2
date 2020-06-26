function delete_storage () {

	localStorage.removeItem("user")

	if (localStorage.getItem('channel'))

		localStorage.removeItem("channel")

};