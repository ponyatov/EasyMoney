RTARGET = x86_64-unknown-linux-gnu
# RTARGET = aarch64-unknown-linux-gnu
# RTARGET = wasm32-unknown-unknown
# RTARGET = thumbv7em-none-eabihf

$(RUSTUP) $(CARGO):
	curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
	$(RUSTUP) component add rustfmt
	$(RUSTUP) target add $(RTARGET)
	$(RUSTUP) target add x86_64-unknown-linux-gnu
	$(RUSTUP) target add aarch64-unknown-linux-gnu
	$(RUSTUP) target add wasm32-unknown-unknown
	$(RUSTUP) target add thumbv7em-none-eabihf

# $(RUSTUP) component add rust-src --toolchain nightly
