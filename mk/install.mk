.PHONY : install update ref gz
install: $(WS)_install $(RUSTUP) $(NPM) $(TSC) $(YO) doc ref gz
	$(MAKE) update
update : $(WS)_update $(RUSTUP) $(NPM)
	$(RUSTUP) self update && $(RUSTUP) update
	$(NPM) update
ref    : $(RF)
gz     : $(GZ)

Debian_install:
# sudo dpkg --add-architecture i386
Debian_update:
	sudo apt update
	sudo apt install -uy `cat apt.$(WS)` $(APT)
