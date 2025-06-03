$(NPM):
	sudo apt install -uy npm nodejs
$(TSC) $(YO): $(NPM)
	npm i -g typescript
