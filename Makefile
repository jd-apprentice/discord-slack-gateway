build:
	npm run build

dev:
	nodemon ./src/index.js

demo:
	nodemon demo.js

publish:
	npm publish

call_function:
	node ./src/utils.js $(function)

bump:
	make call_function function=BumpVersion
