const Nightmare = require('nightmare')
const nightmare = Nightmare({ show: true })

function test_system(){
	nightmare
		.goto('http://localhost:8080/')
		.wait(500)
		.click('li#react-tabs-10')
		.wait(500)
		.click('div#react-tabs-11 > div.container:nth-child(1) > div.row:nth-child(2) > div.container:nth-child(1) > input.btn.btn-outline-danger:nth-child(1)')
		.wait(500)
		.click('div#react-tabs-11 > div.container:nth-child(1) > div.row:nth-child(2) > div.container:nth-child(1) > input.btn.btn-outline-danger:nth-child(2)')
		.wait(500)
		.end()
		.then(function (result) {
			console.log(result)
		})
		.catch(function (error) {
			console.error('Error:', error)
		})
}

module.exports = test_system;
